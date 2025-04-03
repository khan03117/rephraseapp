const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const moment = require("moment-timezone");

exports.create_booking = async (req, res) => {
    const userId = req.user._id;
    const { doctor_id, slot_ids, duration } = req.body;
    if (![30, 60].includes(duration)) {
        return res.json({ success: 0, message: "Invalid duration. Only 30 or 60 minutes allowed." });
    }
    const slots = await Slot.find({ _id: { $in: slot_ids }, doctor: doctor_id, status: "available" })
        .sort({ start_time: 1 }) // Sort to ensure sequential order
        .lean();
    if (slots.length !== slot_ids.length) {
        return res.json({ success: 0, message: "Some slots are already booked or invalid." });
    }
    for (let i = 1; i < slots.length; i++) {
        const prevSlotEnd = moment.utc(slots[i - 1].end_time);
        const currentSlotStart = moment.utc(slots[i].start_time);
        if (!prevSlotEnd.isSame(currentSlotStart)) {
            return res.status(400).json({ success: 0, message: "Slots must be consecutive with no gaps." });
        }
    }
    const expectedSlotCount = duration == 30 ? 1 : 2;
    if (slots.length !== expectedSlotCount) {
        return res.json({ success: 0, message: `For ${duration}-minute booking, select ${expectedSlotCount} consecutive slot(s).` });
    }
    const booking = await Booking.create({
        user: userId,
        doctor: doctor_id,
        slots: slot_ids,
        start_time: slots[0].start_time,
        end_time: slots[slots.length - 1].end_time,
        duration,
        status: "booked"
    });
    await Slot.updateMany({ _id: { $in: slot_ids } }, { $set: { status: "booked" } });
    return res.json({ success: 1, message: "Booking successful", data: booking });

}