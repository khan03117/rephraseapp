import User from "../models/User";
const toIST = (date) => {
    return new Date(date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
};
export const find_slots = async (req, res) => {
    const { doctor_id, date } = req.body;
    date = toIST(date);
    const doctor = await User.findOne({ _id: doctor_id, role: "Doctor" });
    if (!doctor) {
        return res.json({ success: 0, message: "Not found", data: null })
    }
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const now = toIST(new Date());
    const bookedSessions = await Booking.find({
        doctor: doctor_id,
        start_at: { $gte: now, $lte: endOfDay }
    }).sort({ start_at: 1 });
    const availableSlots = [];
    let startSlot = new Date(now);
    while (startSlot < endOfDay) {
        let endSlot = new Date(startSlot);
        endSlot.setMinutes(endSlot.getMinutes() + 30); // Create 30-min slot
        const isOverlapping = bookedSessions.some(session =>
            (startSlot >= session.start_at && startSlot < session.end_at) ||
            (endSlot > session.start_at && endSlot <= session.end_at) ||
            (startSlot <= session.start_at && endSlot >= session.end_at)
        );
        if (!isOverlapping) {
            availableSlots.push({
                start: new Date(startSlot),
                end: new Date(endSlot)
            });
        }
        startSlot.setMinutes(startSlot.getMinutes() + 30);
    }
    return availableSlots;

}