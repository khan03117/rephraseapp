const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const moment = require("moment-timezone");
exports.create_booking = async (req, res) => {
    const userId = req.user._id;
    const { doctor_id, slot_id, booking_date } = req.body;

    const slots = await Slot.findOne({ _id: slot_id, doctor: doctor_id, status: "available" })
        .lean();



    if (!slots) {
        return res.status(400).json({ success: 0, message: "Slot not available or already booked" });
    }
    const isBlocked = await Slot.findOne({ slot_id: slot_id, date: moment.tz(booking_date, "Asia/Kolkata").startOf("day").utc().toDate() });
    if (isBlocked) {
        return res.json({ success: 0, data: [], message: "This slot is already booked" });
    }

    // Extract the time part from slot and apply it to the booking_date
    const slotStart = moment(`${booking_date} ${slots.start_time}`).tz("Asia/Kolkata").format("HH:mm");
    const slotEnd = moment(`${booking_date} ${slots.end_time}`).tz("Asia/Kolkata").format("HH:mm");
    const start_at = moment.tz(`${booking_date} ${slotStart}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc().toDate();
    const end_at = moment.tz(`${booking_date} ${slotEnd}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc().toDate();
    // return res.json({ start_at, end_at });
    const bdata = {
        user: userId,
        doctor: doctor_id,
        booking_date: moment.tz(booking_date, "Asia/Kolkata").startOf("day").utc().toDate(),
        start_at,
        end_at,
        duration: (end_at.getTime() - start_at.getTime()) / 60000,
        status: "booked"
    };
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const parsedDate = new Date(booking_date);
    const weekdayname = weekdays[parsedDate.getDay()];

    const blockdata = {
        weekdayName: weekdayname,
        status: "blocked",
        "doctor": doctor_id,
        "slot_id": slots._id,
        date: moment.tz(booking_date, "Asia/Kolkata").startOf("day").utc().toDate(),
        start_time: slots.start_time,
        end_time: slots.end_time,
        createdAt: new Date()
    }
    // console.log(bdata);
    // return res.json({ bdata });
    await Slot.create(blockdata);
    const booking = await Booking.create(bdata);

    return res.json({ success: 1, message: "Booking successful", data: booking });
};

exports.get_booking = async (req, res) => {
    const userId = req.user._id;
    const role = req.user.role;
    const { date, page = 1, perPage = 10, status, event_timing } = req.query;

    const timezone = "Asia/Kolkata";
    const todayStart = moment.tz(timezone).startOf("day").utc().toDate();
    const todayEnd = moment.tz(timezone).endOf("day").utc().toDate();

    const fdata = {}
    if (role == "User") {
        fdata['user'] = userId
    }
    if (role == "Doctor") {
        fdata['doctor'] = userId
    }
    if (event_timing) {
        if (event_timing == "Upcoming") {
            fdata["booking_date"] = { $gte: todayEnd };
        } else if (event_timing == "Today") {
            fdata["booking_date"] = {
                $gte: todayStart,
                $lte: todayEnd,
            };
        } else if (event_timing == "Past") {
            fdata["booking_date"] = { $lt: todayStart };
        }
    }
    if (status) {
        fdata['status'] = status;
    }
    if (date) {
        fdata["booking_date"] = moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate();
    }
    const totalDocs = await Booking.countDocuments(fdata);
    const totalPages = Math.ceil(totalDocs / perPage);
    const skip = (page - 1) * perPage;
    let bookings = await Booking.find(fdata).populate({
        path: 'doctor',
        select: 'custom_request_id name mobile gender dob address role profile_image profession'
    }).populate({
        path: "user",
        select: 'custom_request_id name mobile gender dob address role profile_image'
    }).populate({
        path: 'slots',
        select: 'date start_time end_time status'
    }).sort({ booking_date: -1 }).skip(skip).limit(perPage).lean();

    bookings = bookings.map(booking => ({
        ...booking,
        booking_date: moment.utc(booking.booking_date).tz("Asia/Kolkata").format("YYYY-MM-DD"),
        slots: booking.slots.map(slot => ({
            ...slot,
            start_time: moment.utc(slot.start_time).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
            end_time: moment.utc(slot.end_time).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
            date: moment.utc(slot.date).tz("Asia/Kolkata").format("YYYY-MM-DD")
        }))
    }));
    const pagination = { perPage, page, totalPages, totalDocs };
    return res.json({ success: 1, message: "List of bookings", data: bookings, pagination, fdata });
}