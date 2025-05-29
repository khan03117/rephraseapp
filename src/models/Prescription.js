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
        type: Schema.Types.Mixed,
    },
    text_type: {
        type: String
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        default: null
    },
    file: {
        type: String
    },
    type: {
        type: String
    },
    show_to_patient: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
module.exports = new model('Prescription', schema);