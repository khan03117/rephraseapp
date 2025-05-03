const User = require("../models/User");
const OtpModel = require("../models/Otp");
const DoctorSpecialization = require("../models/DoctorSpecialization");
const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');
const Clinic = require("../models/Clinic");
async function generateUniqueSlug(name) {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let count = 1;
    const alreadusers = await User.find({ slug });
    // Check if the slug already exists
    count = alreadusers.length + 1;
    if (count > 1) {
        slug = `${slug}-${count}`;
    }


    return slug;
}

exports.send_otp = async (req, res) => {
    try {
        const mobile = req.body.mobile;
        if (!mobile) {
            return res.json({ success: 0, errors: "Mobile is invalid", data: null })
        }
        const checkmobile = await User.findOne({ mobile: mobile });
        if (checkmobile) {
            if (['Employee', 'Admin'].includes(checkmobile.role)) {
                return res.json({
                    errors: [{ 'message': 'Otp login  available to Users only' }],
                    success: 0,
                    data: [],
                    message: 'Otp login  available to Users only'
                })
            }
            if (checkmobile?.is_deleted) {
                return res.status(404).json({ success: 0, data: null, message: 'User Account deleted' });
            }
        }
        const otp = ['8888888888', '9999999999'].includes(mobile.toString()) ? '8888' : Math.floor(1000 + Math.random() * 9000);
        await OtpModel.deleteMany({ mobile: mobile });
        const item = await OtpModel.create({ mobile: mobile, otp: otp });
        // send_otp_mobile(mobile, otp)
        return res.json({
            errors: [],
            success: 1,
            user: checkmobile,
            data: otp,
            message: "Otp Send to Your Mobile Sucessfully."
        });
    } catch (err) {
        return res.json({
            errors: [{ 'message': err.message }],
            success: 0,
            data: [],
            message: err.message
        })
    }
}
exports.verify_otp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        const fields = ['mobile', 'otp'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, errors: 'The following fields are required:', fields: emptyFields });
        }
        const item = await OtpModel.findOne({ mobile: mobile, otp: otp, is_verified: false });
        if (item) {
            await OtpModel.updateOne({ mobile: mobile }, { $set: { is_verified: true } });
            let token = "";
            const userExists = await User.findOne({ mobile: mobile });
            if (userExists) {
                if (userExists?.is_deleted) {
                    return res.json({ data: [], success: 0, message: 'Account deleted' })
                }
                const tokenuser = {
                    _id: userExists._id,
                }
                token = jwt.sign({ user: tokenuser }, SECRET_KEY, { expiresIn: "30 days" });

                await User.findOneAndUpdate({ _id: userExists._id }, { $set: { jwt_token: token } });

            }
            return res.json({
                data: token,
                verification_id: item._id,
                is_exists: userExists ? true : false,
                success: 1,
                errors: [],
                message: userExists ? "Login Successfully" : "Otp Verified successfully"
            })
        } else {
            return res.json({
                data: null,
                is_exists: false,
                success: 0,
                errors: [{ message: "Invalid Otp" }],
                message: "Invalid otp"
            })
        }
    } catch (err) {
        return res.json({
            errors: [{ 'message': err.message }],
            success: 0,
            data: [],
            message: err.message
        })
    }
}
exports.update_profile = async (req, res) => {
    try {
        const id = req.params.id ?? req.user._id;
        const fields = ['name', 'email'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, message: 'The following fields are required:' + emptyFields.join(','), fields: emptyFields });
        }
        // const { mobile } = req.body;

        // const isMobileExists = await User.findOne({ mobile: mobile, _id: { $ne: id } });
        // if (mobile.toString().length != 10) {
        //     return res.json({ success: 0, message: "Mobile is not valid" })
        // }

        // if (isMobileExists) {
        //     return res.json({
        //         errors: [{ 'message': "Mobile is already in use" }],
        //         success: 0,
        //         data: [],
        //         message: "Mobile is already in use"
        //     })
        // }



        const data = {
            ...req.body
        }

        if (req.files.profile_image) {
            data['profile_image'] = req.files.profile_image[0].path
        }
        if (req.files.registration_certificate) {
            data['registration_certificate'] = req.files.registration_certificate[0].path
        }
        if (req.files.graduation_certificate) {
            data['graduation_certificate'] = req.files.graduation_certificate[0].path
        }
        if (req.files.post_graduation_certificate) {
            data['post_graduation_certificate'] = req.files.post_graduation_certificate[0].path
        }
        if (req.files.mci_certificate) {
            data['mci_certificate'] = req.files.mci_certificate[0].path
        }
        if (req.files.aadhaar_front) {
            data['aadhaar_front'] = req.files.aadhaar_front[0].path
        }
        if (req.files.aadhaar_back) {
            data['aadhaar_back'] = req.files.aadhaar_back[0].path
        }
        if (req.files.pan_image) {
            data['pan_image'] = req.files.pan_image[0].path
        }


        const userdata = await User.findOneAndUpdate({ _id: id }, { $set: data });
        // const tokenuser = {
        //     _id: userdata._id,
        // }
        // const token = jwt.sign({ user: tokenuser }, SECRET_KEY, { expiresIn: "1 days" })
        return res.json({
            data: userdata,
            // token,
            success: 1,
            errors: [],
            message: "User created successfully"
        });

    } catch (err) {
        return res.json({
            errors: [{ 'message': err.message }],
            success: 0,
            data: [],
            message: err.message
        })
    }
}
exports.user_list = async (req, res) => {
    try {

        // const admin = await User.create({ name: "Admin", email: "admin@refresh.com", mobile: "9089898989", password: "Admin@123#", role: "Admin" });
        // console.log(admin);
        // const allusers = await User.find().lean();
        // allusers.map(async usr => {

        //     const udata = {
        //         profession: "Psychiatrist"
        //     }
        //     await User.updateMany({ _id: usr._id }, { $set: udata })
        // })
        const fdata = {
            role: { $nin: ['Admin', 'Employee'] }
        };
        const { type, keyword, exportdata, status, id, url, longitude, latitude, maxDistance = 5000, page = 1, perPage = 10, sort = "updatedAt", order } = req.query;
        if (longitude && latitude) {
            fdata['coordinates'] = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseInt(maxDistance) // Max distance in meters
                }
            }
        }
        const skip = (page - 1) * perPage;
        if (type) {
            fdata['role'] = type;
        }
        if (id) {
            fdata['_id'] = id;
        }
        if (url) {
            fdata['slug'] = url;
        }
        if (keyword) {
            fdata["$or"] = [
                { name: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
                { mobile: { $regex: keyword, $options: "i" } },
            ];
        }
        const resp = await User.find(fdata).sort({ created_at: -1 }).skip(skip).limit(perPage);

        const totaldocs = await User.countDocuments(fdata);
        const totalPage = Math.ceil(totaldocs / perPage); // Calculate total pages
        const pagination = {
            page: page,
            perPage,
            totalPages: totalPage,
            totalDocs: totaldocs
        };
        return res.json({ success: 1, message: "list of users", data: resp, pagination, fdata });

    } catch (err) {
        return res.json({
            errors: [{ 'message': err.message }],
            success: 0,
            data: [],
            message: err.message
        })
    }

}
exports.store_profile = async (req, res) => {
    try {
        const fields = ['mobile', 'name', 'role'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, message: 'The following fields are required:' + emptyFields.join(','), fields: emptyFields });
        }
        const { name, email, mobile, role } = req.body;
        if (!['Doctor', 'User'].includes(role)) {
            return res.json({ success: 0, message: "Invalid role type", data: null })
        }
        const slug = await generateUniqueSlug(req.body.name);
        // if (!req.user) {
        //     const checkIsMobileVerified = await OtpModel.findOne({ mobile: mobile, is_verified: true });
        //     if (!checkIsMobileVerified) {
        //         return res.json({ success: 0, message: "Mobile number is not verified" });
        //     }
        // }
        const isMobileExists = await User.findOne({ mobile: mobile });
        if (mobile.toString().length != 10) {
            return res.json({ success: 0, message: "Mobile is not valid" })
        }
        if (isMobileExists) {
            return res.json({
                errors: [{ 'message': "Mobile is already in use" }],
                success: 0,
                data: [],
                message: "Mobile is already in use"
            })
        }
        const lastReuest = await User.findOne().sort({ request_id: -1 });
        let new_request_id = 1;
        if (lastReuest) {
            new_request_id = lastReuest.request_id + 1
        }
        const prefix = role == "User" ? 'USER' : 'DOCTOR';
        const data = {
            ...req.body,
            slug: slug,
            request_id: new_request_id,
            custom_request_id: prefix + String(new_request_id).padStart(10, '0'),
            name: name,
            mobile: mobile,
            role: role

        }
        if (req.body.email) {
            data['email'] = email.toLowerCase()
        }

        if (req.files.image) {
            data['profile_image'] = req.files.image[0].path
        }
        if (req.files.registration_certificate) {
            data['registration_certificate'] = req.files.registration_certificate[0].path
        }
        if (req.files.graduation_certificate) {
            data['graduation_certificate'] = req.files.graduation_certificate[0].path
        }
        if (req.files.post_graduation_certificate) {
            data['post_graduation_certificate'] = req.files.post_graduation_certificate[0].path
        }
        if (req.files.mci_certificate) {
            data['mci_certificate'] = req.files.mci_certificate[0].path
        }
        if (req.files.aadhaar_front) {
            data['aadhaar_front'] = req.files.aadhaar_front[0].path
        }
        if (req.files.aadhaar_back) {
            data['aadhaar_back'] = req.files.aadhaar_back[0].path
        }
        if (req.files.pan_image) {
            data['pan_image'] = req.files.pan_image[0].path
        }
        const resp = await User.create(data);
        const tokenuser = {
            _id: resp._id,
        }
        const doctor_id = resp._id;
        if (req.body.specialization) {
            const arr = JSON.parse(req.body.specialization);
            arr.forEach(async itm => {
                await DoctorSpecialization.create({ doctor: doctor_id, specialization: itm });
            })
        }
        if (req.body.clinics) {
            const clinics = JSON.parse(req.body.clinics); // clinics should be a JSON string
            for (const clinicdata of clinics) {
                await Clinic.create({
                    ...clinicdata,
                    doctor: resp._id
                });
            }
        }
        const token = jwt.sign({ user: tokenuser }, SECRET_KEY, { expiresIn: "1 days" })

        return res.json({ success: 1, token, message: "User created successfully", data: resp })


    } catch (err) {
        return res.json({
            errors: [{ 'message': err.message }],
            success: 0,

            data: [],
            message: err.message
        })
    }
}
exports.admin_login = async (req, res) => {
    try {
        const fields = ['password', 'email'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, message: 'The following fields are required:' + emptyFields.join(','), fields: emptyFields });
        }
        const { email, password } = req.body;
        const fdata = {
            email: email,
            password: password,
            role: "Admin"
        }
        const userfind = await User.findOne(fdata);
        if (!userfind) {
            return res.json({ success: 0, message: "Invalid credentials", data: null });
        }
        const tokenuser = {
            _id: userfind._id,
        }
        const token = userfind ? jwt.sign({ user: tokenuser }, SECRET_KEY, { expiresIn: "30 days" }) : ""
        return res.json({ success: 1, message: 'Login successfully', data: token });
    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}
exports.my_profile = async (req, res) => {
    const user_id = req.user._id;
    const userfind = await User.findOne({ _id: user_id });
    const specialization = await DoctorSpecialization.find({ doctor: user_id }).populate('specialization');
    const data = {
        ...userfind.toObject(),
        specialization: specialization
    }
    return res.json({ data: data, success: 1, message: "Profile" })
}