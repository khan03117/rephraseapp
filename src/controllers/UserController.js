const User = require("../models/User");
const OtpModel = require("../models/Otp");
const SECRET_KEY = process.env.SECRET_KEY;

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
        send_otp_mobile(mobile, otp)
        return res.json({
            errors: [],
            success: 1,
            user: checkmobile,
            data: item,
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
            let exists = "";
            const userExists = await User.findOne({ mobile: mobile });
            if (!userExists) {
                exists = await User.create({ mobile: mobile, role: "User" })
            } else {
                if (userExists?.is_deleted) {
                    return res.json({ data: [], success: 0, message: 'Account deleted' })
                }
                exists = userExists
            }
            let token;
            if (exists) {
                const tokenuser = {
                    _id: exists._id,
                }
                token = exists ? jwt.sign({ user: tokenuser }, SECRET_KEY, { expiresIn: "30 days" }) : ""
                if (exists) {
                    await User.findOneAndUpdate({ _id: exists._id }, { $set: { jwt_token: token } });
                }
            }


            return res.json({
                data: token,
                verification_id: item._id,
                is_exists: exists ? true : false,
                success: 1,
                errors: [],
                message: "Login Successfully"
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
        const id = req.user._id;
        const fields = ['mobile', 'name', 'email'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, message: 'The following fields are required:' + emptyFields.join(','), fields: emptyFields });
        }
        const { name, email, mobile } = req.body;
        const isMobileVerified = await OtpModel.findOne({ mobile: mobile, is_verified: true });
        const isMobileExists = await User.findOne({ mobile: mobile, _id: { $ne: id } });
        if (mobile.toString().length != 10) {
            return res.json({ success: 0, message: "Mobile is not valid" })
        }
        if (!isMobileVerified) {
            return res.json({
                errors: [{ 'message': "Mobile is not verified" }],
                success: 0,
                data: [],
                message: "Mobile is not verified"
            })
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

        const data = {
            request_id: new_request_id,
            custom_request_id: 'USER' + String(new_request_id).padStart(10, '0'),
            name: name,
            email: email.toLowerCase(),
            mobile: mobile,
            role: "User"
        }
        if (ref_code) {
            const refuser = await User.findOne({ ref_code });
            if (refuser) {
                data['refer_by'] = refuser._id
            }
        }
        if (req.file) {
            data['profile_image'] = req.file.path
        }

        if (isMobileExists) {
            const userdata = await User.findOneAndUpdate({ _id: isMobileExists._id }, { $set: data });
            const tokenuser = {
                _id: userdata._id,
            }
            const token = jwt.sign({ user: tokenuser }, SECRET_KEY, { expiresIn: "1 days" })
            return res.json({
                data: userdata,
                token,
                success: 1,
                errors: [],
                message: "User created successfully"
            });
        } else {
            return res.json({ success: 0, message: "Invalid request" });
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
exports.user_list = async (req, res) => {
    try {
        const fdata = {
            role: { $nin: ['Admin', 'Employee'] }
        };
        const { type, keyword, exportdata, status, id, longitude, latitude, maxDistance = 5000, page = 1, perPage = 10, sort = "updatedAt", order } = req.query;
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
            current_page: page,
            perPage,
            totalPage,
            totalRecords: totaldocs
        };
        return res.json({ success: 1, message: "list of users", data: resp, pagination });

    } catch (err) {
        return res.json({
            errors: [{ 'message': err.message }],
            success: 0,
            data: [],
            message: err.message
        })
    }

}