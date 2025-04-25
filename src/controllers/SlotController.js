const { response } = require("express");
const Slot = require("../models/Slot");
const moment = require("moment-timezone");
const Booking = require("../models/Booking");
exports.create_slot = async (req, res) => {
    const doctorId = req.user._id;
    const { date, availability, slot_type, block_type, block_at, duration, gap } = req.body;
    if (!duration) {
        return res.json({ success: 0, data: mull, message: "Duration is mandatory" })
    }
    if (!gap) {
        return res.json({ success: 0, data: mull, message: "Gap is mandatory" })
    }
    const slotDate = moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate();
    const generateTimeSlots = (date, start, end) => {
        let slots = [];
        let startTime = moment.tz(`${date} ${start}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc();
        let endTime = moment.tz(`${date} ${end}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc();
        while (startTime.isBefore(endTime)) {
            let slotEndTime = startTime.clone().add(duration, "minutes");
            slots.push({
                doctor: doctorId,
                date: slotDate,
                start_time: startTime.toDate(),
                end_time: slotEndTime.toDate(),
                status: "available",
                slot_type,
                block_type,
                block_at: block_at ? moment.tz(block_at, "Asia/Kolkata").utc().toDate() : null
            });
            slotEndTime = slotEndTime.clone().add(gap, "minutes");
            startTime = slotEndTime;
        }
        return slots;
    };
    let slotsToSave = [];
    availability.forEach(slot => {
        slotsToSave.push(...generateTimeSlots(date, slot.start_time, slot.end_time));
    });
    const existingSlots = await Slot.find({ doctor: doctorId, date: slotDate });
    if (existingSlots.length > 0) {
        await Slot.deleteMany({ doctor: doctorId, date: slotDate, status: "available" });
        await Slot.insertMany(slotsToSave); // Insert new slots
        return res.json({ success: 1, message: "Slots updated successfully", data: slotsToSave });
    } else {
        const resp = await Slot.insertMany(slotsToSave);
        return res.json({ success: 1, message: "Slots created successfully", data: resp });
    }
};
exports.create_slot_by_weekdays = async (req, res) => {
    const doctorId = req.user._id;
    const { date, dayname, availability, slot_type, block_type, block_at, duration, gap } = req.body;

    // Check if duration and gap are provided
    if (!duration) {
        return res.json({ success: 0, data: null, message: "Duration is mandatory" });
    }
    if (!gap) {
        return res.json({ success: 0, data: null, message: "Gap is mandatory" });
    }

    const slot_date = new Date(date);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Validate the weekday
    if (!weekdays.includes(dayname)) {
        return res.json({ success: 0, data: null, message: "Please enter correct dayname" });
    }

    let weekdayName = dayname;
    if (date) {
        weekdayName = weekdays[slot_date.getDay()];
    }

    // Convert date to UTC timezone
    const slotDate = moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate();

    // Function to generate time slots based on the given start and end times
    const generateTimeSlots = (date, start, end) => {
        let slots = [];
        let startTime = moment.tz(`${date} ${start}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc();
        let endTime = moment.tz(`${date} ${end}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").utc();

        // Generate the slots
        while (startTime.isBefore(endTime)) {
            let slotEndTime = startTime.clone().add(duration, "minutes");
            slots.push({
                doctor: doctorId,
                weekdayName,
                date: slotDate,
                start_time: startTime.toDate(),
                end_time: slotEndTime.toDate(),
                status: "available",
                slot_type,
                block_type,
                block_at: block_at ? moment.tz(block_at, "Asia/Kolkata").utc().toDate() : null
            });
            slotEndTime = slotEndTime.clone().add(gap, "minutes");
            startTime = slotEndTime;
        }

        return slots;
    };

    // Flatten all the generated slots based on the availability array
    let slotsToSave = [];
    availability.forEach(slot => {
        slotsToSave.push(...generateTimeSlots(date, slot.start_time, slot.end_time));
    });

    // Fetch the existing slots for the doctor on the same weekday
    const existingSlots = await Slot.find({ doctor: doctorId, weekdayName });

    // Check for overlapping slots: filter out any slot that overlaps with existing ones
    const newSlots = slotsToSave.filter(newSlot => {
        return !existingSlots.some(existingSlot => {
            return (
                moment(newSlot.start_time).isBefore(existingSlot.end_time) &&
                moment(newSlot.end_time).isAfter(existingSlot.start_time)
            );
        });
    });

    // If there are no new slots (all are overlaps), return a message
    if (newSlots.length === 0) {
        return res.json({ success: 0, message: "No new slots to add (overlap detected)", data: [] });
    }

    // Insert the new slots into the database (don't delete existing ones)
    const resp = await Slot.insertMany(newSlots);

    // Return success response
    return res.json({ success: 1, message: "Slots added successfully", data: resp });
};




exports.get_slot = async (req, res) => {
    try {
        const { date, doctor_id } = req.query;
        if (!date || !doctor_id) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        // Convert date to JS Date and get weekday
        const inputDate = moment.tz(date, "Asia/Kolkata").toDate();
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weekdayName = weekdays[inputDate.getDay()];

        // Get base slots by weekdayName + doctor
        const baseSlots = await Slot.find({ weekdayName, doctor: doctor_id }).lean().sort({ start_time: 1 });

        // Get all bookings and blocked slots on the specific date
        const bookings = await Booking.find({ booking_date: moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate(), doctor: doctor_id }).lean();
        const blockedSlots = await Slot.find({ date, status: "blocked", doctor: doctor_id }).lean();

        // Helper: compare only time part (HH:mm in IST)
        const isSameTime = (t1, t2) => {
            const time1 = moment(t1).tz("Asia/Kolkata").format("HH:mm");
            const time2 = moment(t2).tz("Asia/Kolkata").format("HH:mm");
            return time1 == time2;
        };

        // Map each base slot to its status for the given date
        const slotsWithStatus = baseSlots.map(slot => {
            const startIST = moment(slot.start_time).tz("Asia/Kolkata").format("HH:mm");
            const endIST = moment(slot.end_time).tz("Asia/Kolkata").format("HH:mm");

            const isBlocked = blockedSlots.some(b => isSameTime(b.start_time, slot.start_time));
            const isBooked = bookings.some(b =>
                isSameTime(b.start_at, slot.start_time) &&
                isSameTime(b.end_at, slot.end_time)
            );

            // Return only necessary fields
            return {
                _id: slot._id,
                doctor: slot.doctor,
                weekdayName: slot.weekdayName,
                start_time: startIST,
                end_time: endIST,
                status: isBlocked ? "blocked" : isBooked ? "booked" : "available",
                createdAt: slot.createdAt,
                updatedAt: slot.updatedAt,
            };
        });

        res.status(200).json(slotsWithStatus);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getAllSlots = async (req, res) => {
    const { date, doctor_id, duration = 30 } = req.query;
    const fdata = {};
    if (date) {
        fdata["date"] = moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate();
    } else {
        const today = new Date();
        fdata["date"] = { $gte: today };
    }
    if (doctor_id) {
        fdata["doctor"] = doctor_id;
    }
    if (req.user.role == "Doctor") {
        fdata['doctor'] = req.user._id
    }
    const resp = await Slot.find(fdata).populate({
        path: "doctor",
        select: "name profile_image mobile role"
    })
    return res.json({ success: 1, message: "List of slots", data: resp });
}