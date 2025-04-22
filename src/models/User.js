const { Schema, model } = require("mongoose");

const schema = new Schema({
    request_id: {
        type: Number,
        default: 0
    },
    custom_request_id: {
        type: String
    },
    slug: {
        type: String,

    },
    profile_image: {
        type: String,
        trim: true,
        default: null
    },
    name: {
        type: String,
        trim: true,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    mobile: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    dob: {
        type: Date
    },
    profession: {
        type: String
    },
    marital_status: {
        type: String
    },
    address: {
        type: String
    },
    about_yourself: {
        type: String
    },
    refer_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ref_code: {
        type: String
    },
    role: {
        type: String,
        enum: ['User', 'Doctor', 'Employee', 'Admin', 'SubAdmin',],
        default: null
    },
    roles: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: null
    },
    password: {
        type: String,
        default: null,
        // select: false
    },
    mode: {
        type: [String]
    },
    languages: {
        type: [String]
    },
    mci_number: {
        type: String
    },
    coordinates: {
        type: { type: String, default: "Point" },
        coordinates: {
            type: [Number],
            index: "2dsphere"
        }
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    pincode: {
        type: String,
    },
    languages: {
        type: [String]
    },
    mode: {
        type: [String]
    },
    experience: {
        type: String
    },
    educational_qualification: {
        type: String
    },
    registration_certificate: {
        type: String
    },
    graduation_certificate: {
        type: String
    },
    post_graduation_certificate: {
        type: String
    },
    mci_certificate: {
        type: String
    },
    aadhaar_number: {
        type: String
    },
    aadhaar_front: {
        type: String
    },
    aadhaar_back: {
        type: String
    },
    pan_number: {
        type: String
    },
    pan_image: {
        type: String
    },
    fcm_token: {
        type: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    jwt_token: {
        type: String
    }

}, { timestamps: true });
module.exports = new model('User', schema);