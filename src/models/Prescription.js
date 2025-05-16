const { Schema, model } = require("mongoose");

const schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "PrescriptionCategory",
        default: null
    },
    text: {
        type: String
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    booking: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    file: {
        type: String
    },
    type: {
        type: String
    }
}, { timestamps: true });
module.exports = new model('Prescription', schema);