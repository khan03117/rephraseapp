const mongoose = require("mongoose");
const slotSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date },
    weekdayName: {
        type: String
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
        default: null
    },
    start_time: {
        type: String
    },
    end_time: {
        type: String
    },
    isHoliday: {
        type: Boolean,
        default: false
    },
    status: { type: String, enum: ["available", "booked", "blocked"], default: "available" },
    block_type: { type: String, default: null },
    block_at: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Slot = mongoose.model("Slot", slotSchema);

module.exports = Slot;
