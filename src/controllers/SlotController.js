const { response } = require("express");
const Slot = require("../models/Slot");
const moment = require("moment-timezone");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Clinic = require("../models/Clinic");
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
    try {
        const { date, dayname, availability, duration, gap, clinic } = req.body;
        const doctorId = req.user._id;
        const finddoctor = await User.findOne({ _id: doctorId, role: "Doctor" });
        const findClinics = await Clinic.find({ doctor: doctorId });
        if (!finddoctor) {
            return res.json({ success: 0, data: null, message: "Only doctor can add slots" });
        }
        if (findClinics.length > 0 && !clinic) {
            return res.json({ success: 0, data: null, message: "Please select clinic" });
        }
        if (!duration) {
            return res.json({ success: 0, data: null, message: "Duration is mandatory." });
        }
        if (!gap) {
            return res.json({ success: 0, data: null, message: "Gap is mandatory." });
        }
        if (!dayname) {
            return res.json({ success: 0, data: null, message: "Dayname is mandatory." });
        }
        if (!availability || !Array.isArray(availability) || availability.length === 0) {
            return res.json({ success: 0, data: null, message: "Availability array is mandatory and should not be empty." });
        }
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (!weekdays.includes(dayname)) {
            return res.json({ success: 0, data: null, message: "Please enter a correct dayname (e.g., Monday)." });
        }
        let slotDate = null;
        let weekdayName = dayname;
        if (date) {
            const parsedDate = new Date(date);

            if (isNaN(parsedDate)) {
                return res.json({ success: 0, data: null, message: "Invalid date format." });
            }

            // Get correct weekday from date
            weekdayName = weekdays[parsedDate.getDay()];

            // Convert date to start of day UTC (Asia/Kolkata timezone)
            slotDate = moment.tz(date, "Asia/Kolkata").startOf("day").utc().toDate();
        }

        const slotsToSave = [];

        for (const range of availability) {
            let start = moment(range.start_time, "HH:mm");
            const end = moment(range.end_time, "HH:mm");
            while (start.clone().add(duration, 'minutes').isSameOrBefore(end)) {
                const slotStartTime = start.format("HH:mm");
                const slotEndTime = start.clone().add(duration, 'minutes').format("HH:mm");
                const newSlot = {
                    doctor: doctorId,
                    clinic: clinic || null,
                    date: slotDate || null, // if provided
                    weekdayName: weekdayName,
                    start_time: slotStartTime, // Save as "HH:mm" string
                    end_time: slotEndTime,
                    status: "available",
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                slotsToSave.push(newSlot);
                start = start.clone().add(duration + gap, 'minutes');
            }
        }
        if (slotsToSave.length > 0) {
            const de_dat = { doctor: doctorId, weekdayName };
            if (clinic) {
                de_dat['clinic'] = clinic;
            }
            await Slot.deleteMany(de_dat);
            await Slot.insertMany(slotsToSave);
        }
        return res.status(201).json({
            success: 1,
            message: "Slots created successfully.",
            total_slots: slotsToSave.length,
            data: slotsToSave
        });

    } catch (error) {
        console.error("Error in create_slot_by_weekdays:", error);
        return res.status(500).json({ success: 0, data: null, message: "Server error while creating slots." });
    }
};

exports.get_slot = async (req, res) => {
    try {
        const { date, doctor_id } = req.query;

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