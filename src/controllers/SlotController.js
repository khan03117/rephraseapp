const Slot = require("../models/Slot");
const moment = require("moment-timezone");
const convertISTtoUTC = (dateString, timeString) => {
    return moment.tz(`${dateString} ${timeString}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc().toDate();
};
// const istDate = new Intl.DateTimeFormat("en-IN", {
//     timeZone: "Asia/Kolkata",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
// }).format(date);

exports.create_slot = async (req, res) => {
    const doctorId = req.user._id;
    const { date, availability, slot_type, block_type, block_at } = req.body;
    const formattedAvailability = availability.map(slot => ({
        ...slot,
        start_time: moment.tz(`${date} ${slot.start_time}`, "YYYY-MM-DD hh:mm A", "Asia/Kolkata").utc().toDate(),
        end_time: moment.tz(`${date} ${slot.end_time}`, "YYYY-MM-DD hh:mm A", "Asia/Kolkata").utc().toDate()
    }));
    const data = {
        doctor: doctorId,
        date: moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate(), // Convert to UTC
        availability: formattedAvailability,
        slot_type,
        block_type,
        block_at: block_at ? moment.tz(block_at, "Asia/Kolkata").utc().toDate() : null
    };
    const isExists = await Slot.find({ doctor: doctorId, date: moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate() });
    if (isExists.length > 0) {
        await Slot.deleteMany({ _id: { $in: isExists.map(itm => itm._id) } });
    }
    const resp = await Slot.create(data);
    return res.json({ success: 1, message: "Blocked successfully", data: resp });

}

exports.get_slot = async (req, res) => {
    const { date } = req.query
    const fdata = {};
    if (date) {
        fdata['date'] = moment.tz(date, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc().toDate();
    }
    if (req.user.role == "Doctor") {
        fdata['doctor'] = req.user._id
    }
    const resp = await Slot.find(fdata);
    return res.json({ success: 1, message: "List of blocked slots", data: resp });
}