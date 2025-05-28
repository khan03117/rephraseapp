const { default: mongoose } = require("mongoose");
const DoctorSpecialization = require("../models/DoctorSpecialization");
const User = require("../models/User");
const Specialization = require("../models/Specialization");
const Clinic = require("../models/Clinic");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const moment = require("moment-timezone");

exports.handle_specility = async (req, res) => {
    const { doctor_id } = req.params;
    const isDoctorExists = await User.findOne({ role: 'Doctor', _id: doctor_id });
    if (!isDoctorExists) {
        return res.json({ success: 0, message: "Invalid therapiest", data: [] });
    }
    const { spcility_id } = req.body;
    const isExists = await DoctorSpecialization.findOne({ doctor: doctor_id, specialization: spcility_id });
    if (isExists) {
        await DoctorSpecialization.findOneAndUpdate({ _id: isExists._id }, { $set: { is_active: !isExists.is_active } });
        return res.json({ success: 1, message: `Specility ${isExists.is_active ? 'activated' : 'deactivted'} successfully` });
    } else {
        await DoctorSpecialization.create({ doctor: doctor_id, specialization: spcility_id });
        return res.json({ success: 1, message: "Specility Activated successfully" });
    }

}
exports.get_specility = async (req, res) => {
    const { doctor_id } = req.params;
    const isDoctorExists = await User.findOne({ role: 'Doctor', _id: doctor_id });
    if (!isDoctorExists) {
        return res.json({ success: 0, message: "Invalid therapiest", data: [] });
    }
    const resps = await DoctorSpecialization.find({ doctor: doctor_id, is_active: true });
    return res.json({ success: 1, message: "List of specilities", data: resps });
}
exports.getDoctorWithSpecialization = async (req, res) => {
    const { url, keyword, id, languages = [], specility = [], mode = [], page = 1, perPage = 10 } = req.query;
    try {
        const languagesArr = Array.isArray(languages) ? languages : languages.split(',').filter(Boolean);
        const specilityArr = Array.isArray(specility) ? specility : specility.split(',').filter(Boolean);
        const modeArr = Array.isArray(mode) ? mode : mode.split(',').filter(Boolean);

        const fdata = {
            "role": "Doctor",
            "is_active": true
        }
        if (languagesArr.length) {
            fdata['languages'] = { $in: languagesArr };
        }
        if (req.user) {
            if (req.user.role == "Doctor") {
                const finnddoc = await User.findOne({ _id: req.user._id });
                fdata['_id'] = finnddoc._id;
            }
        }
        if (specilityArr.length > 0) {
            const finddoctors = await DoctorSpecialization.find({ specialization: { $in: specilityArr } });
            if (finddoctors.length > 0) {
                const docids = finddoctors.map(itm => itm.doctor);
                fdata['_id'] = { $in: docids };
            } else {
                return res.json({ success: 1, data: [], message: 'Not found', pagination: { perPage, page, totalPages: 1, totalDocs: 0 } })
            }

        }

        if (modeArr.length) {
            fdata['mode'] = { $in: modeArr };
        }
        if (url) {
            const usr = await User.findOne({ slug: url }).lean();
            if (usr) {
                fdata['_id'] = usr._id;
            }
        }
        if (id) {
            const usr = await User.findOne({ _id: id }).lean();
            if (usr) {
                fdata['_id'] = usr._id;
            }
        }
        if (keyword) {
            fdata["$or"] = [
                { name: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
                { mobile: { $regex: keyword, $options: "i" } },
            ];
        }
        const totalDocs = await User.countDocuments(fdata);
        const totalPages = Math.ceil(totalDocs / perPage);
        const skip = (page - 1) * perPage;


        const doctors = await User.aggregate([
            {
                $match: fdata
            },
            {
                $lookup: {
                    from: "doctorspecializations",
                    localField: "_id",
                    foreignField: "doctor",
                    as: "specializations",
                }
            },
            {
                $lookup: {
                    from: "specializations",
                    localField: "specializations.specialization",
                    foreignField: "_id",
                    as: "specializationDetails",

                }
            },

            {
                $lookup: {
                    from: "slots",
                    localField: "_id",
                    foreignField: "doctor",
                    as: "slots",
                    pipeline: [
                        {
                            $match: { isHoliday: false, status: "available", weekdayName: moment().format('dddd') }
                        },
                        { $limit: 2 }
                    ]
                }
            },
            {
                $lookup: {
                    from: "clinics",
                    localField: "_id",
                    foreignField: "doctor",
                    as: "clinics",
                }
            },


            {
                $project: {
                    _id: 1, // Including _id field
                    request_id: 1,
                    custom_request_id: 1,
                    profile_image: 1,
                    slug: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    consultation_charge: 1,
                    consultation_charge_offline: 1,
                    dob: 1,
                    profession: 1,
                    marital_status: 1,
                    address: 1,
                    about_yourself: 1,
                    refer_by: 1,
                    ref_code: 1,
                    role: 1,
                    roles: 1,
                    slots: 1,
                    mci_number: 1,
                    coordinates: 1,
                    languages: 1,
                    mode: 1,
                    state: 1,
                    city: 1,
                    pincode: 1,
                    is_active: 1,
                    registration_certificate: 1,
                    graduation_certificate: 1,
                    post_graduation_certificate: 1,
                    mci_certificate: 1,
                    aadhaar_front: 1,
                    aadhaar_back: 1,
                    pan_image: 1,
                    fcm_token: 1,
                    is_deleted: 1,
                    jwt_token: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    specializationDetails: { title: 1, _id: 1 },
                    clinics: 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            { $skip: parseInt(skip) },
            { $limit: parseInt(perPage) },
        ]);
        const pagination = { perPage, page, totalPages, totalDocs }
        return res.json({ success: 1, message: "List of doctors", data: doctors, pagination })
    } catch (error) {
        console.error("Error fetching doctor with specialization:", error);
    }
}
exports.clinics = async (req, res) => {
    try {
        const { id, page = 10, perPage = 10 } = req.query;
        const fdata = {};
        if (req.user.role == "Doctor") {
            fdata['doctor'] = req.user._id;
        }
        const items = await Clinic.find(fdata);
        return res.json({ success: 1, data: items, message: "List of clinics" });
    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}
exports.add_patient = async (req, res) => {
    try {
        const { name, email, mobile, dob, address, age, gender, marital_status, state, city, pincode, slot_id, booking_date } = req.body;
        const isMobileRegistered = await User.findOne({ mobile });
        let user_id;
        if (isMobileRegistered) {
            user_id = isMobileRegistered._id;
        } else {
            const newuser = await User.create({ name, dob, address, email, mobile, age, gender, marital_status, state, city, pincode });
            user_id = newuser._id;
        }
        const request_by = req.user._id;
        const request_user = await User.findOne({ _id: request_by });
        if (request_user.role != "Doctor") {
            return res.status(403).json({ success: 0, message: "Invalid doctor type" });
        }
        const doctor_id = request_user._id;
        const slots = await Slot.findOne({ _id: slot_id, doctor: doctor_id, status: "available" })
            .lean();
        if (!slots) {
            return res.status(400).json({ success: 0, message: "Slot not available or already booked" });
        }
        const isBlocked = await Slot.findOne({ slot_id: slot_id, date: moment.tz(booking_date, "Asia/Kolkata").startOf("day").utc().toDate() });
        if (isBlocked) {
            return res.json({ success: 0, data: [], message: "This slot is already booked" });
        }
        const slotStart = moment(`${booking_date} ${slots.start_time}`).tz("Asia/Kolkata").format("HH:mm");
        const slotEnd = moment(`${booking_date} ${slots.end_time}`).tz("Asia/Kolkata").format("HH:mm");
        const start_at = moment.tz(`${booking_date} ${slotStart}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc().toDate();
        const end_at = moment.tz(`${booking_date} ${slotEnd}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc().toDate();

        const bdata = {
            mode: "Offline",
            user: user_id,
            doctor: doctor_id,
            booking_date: moment.tz(booking_date, "Asia/Kolkata").startOf("day").utc().toDate(),
            start_at,
            end_at,
            duration: (end_at.getTime() - start_at.getTime()) / 60000,
            status: "booked"
        };
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const parsedDate = new Date(booking_date);
        const weekdayname = weekdays[parsedDate.getDay()];

        const blockdata = {
            weekdayName: weekdayname,
            status: "blocked",
            "doctor": doctor_id,
            "slot_id": slots._id,
            date: moment.tz(booking_date, "Asia/Kolkata").startOf("day").utc().toDate(),
            start_time: slots.start_time,
            end_time: slots.end_time,
            createdAt: new Date()
        }
        // console.log(bdata);
        // return res.json({ bdata });
        const blockedSlot = await Slot.create(blockdata);
        bdata['booked_slot'] = blockedSlot._id;
        const booking = await Booking.create(bdata);
        return res.json({ success: 1, message: "Booking created successfully", data: booking })

    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}
exports.handleActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { action_type, ...request_obj } = req.body;
        if (!action_type) {
            return res.status(400).json({ success: 0, message: 'action_type is required' });
        }
        const updatedUser = await User.findByIdAndUpdate(id, { $set: request_obj }, { new: true });
        return res.json({ success: 1, data: updatedUser, message: "Updated successfully" });
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }
}