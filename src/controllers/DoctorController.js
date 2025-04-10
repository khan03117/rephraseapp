const DoctorSpecialization = require("../models/DoctorSpecialization");
const User = require("../models/User");

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

    try {
        const doctors = await User.aggregate([
            {
                $match: { "role": "Doctor" }
            },
            {
                $lookup: {
                    from: "doctorspecializations",
                    localField: "_id",
                    foreignField: "doctor",
                    as: "specializations"
                }
            },
            {
                $lookup: {
                    from: "specializations",
                    localField: "specializations.specialization",
                    foreignField: "_id",
                    as: "specializationDetails"
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
                    dob: 1,
                    profession: 1,
                    marital_status: 1,
                    address: 1,
                    about_yourself: 1,
                    refer_by: 1,
                    ref_code: 1,
                    role: 1,
                    roles: 1,
                    mci_number: 1,
                    coordinates: 1,
                    state: 1,
                    city: 1,
                    pincode: 1,
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
                    specializationDetails: { title: 1, _id: 1 }
                }
            }
        ]);

        return res.json({ success: 1, message: "List of doctors", data: doctors })
    } catch (error) {
        console.error("Error fetching doctor with specialization:", error);
    }
}
exports.add_appointment = async (req, res) => {

}
