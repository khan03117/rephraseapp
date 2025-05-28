const { Schema, model } = require("mongoose");

const schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    bank_name: {
        type: String
    },
    ifsc: {
        type: String
    },
    account_type: {
        type: String
    },
    account_number: {
        type: String
    },
    account_holder_name: {
        type: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
module.exports = new model('UserBank', schema);