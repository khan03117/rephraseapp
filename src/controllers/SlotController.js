const Slot = require("../models/Slot");
const moment = require("moment-timezone");
const convertISTtoUTC = (dateString, timeString) => {
    return moment.tz(`${dateString} ${timeString}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc().toDate();
};
exports.create_slot = async (req, res) => {
    const doctorId = req.user._id;
    const { date, availability, slot_type, block_type, block_at } = req.body;
    const formattedAvailability = availability.map(slot => ({
        ...slot,
        start_time: convertISTtoUTC(date, slot.start_time),
        end_time: convertISTtoUTC(date, slot.end_time)
    }));
    const data = {
        doctor: doctorId,
        date: moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate(), // Convert to UTC
        availability: formattedAvailability,
        slot_type,
        block_type,
        block_at: block_at ? moment.tz(block_at, "Asia/Kolkata").utc().toDate() : null
    };
    const resp = await Slot.create(data);
    return res.json({ success: 1, message: "Blocked successfully", data: resp });

}

exports.get_slot = async (req, res) => {
    const { date } = req.query
    const fdata = {};
    if (date) {
        fdata['date'] = date;
    }
    if (req.user.role == "Doctor") {
        fdata['doctor'] = req.user._id
    }
    const resp = await Slot.find(fdata);
    return res.json({ success: 1, message: "List of blocked slots", data: resp });
}