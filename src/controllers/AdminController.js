const Booking = require("../models/Booking");
const User = require("../models/User");

exports.dashboard = async (req, res) => {
    try {
        const totalDoctors = await User.countDocuments({ role: "Doctor" });
        const totalUsers = await User.countDocuments({ role: "User" });
        const totalBookings = await Booking.countDocuments({ status: "Pending" });
        const data = {
            totalDoctors, totalUsers, totalBookings
        }
        return res.json({ success: 1, message: "Dashboard data", data: data });
    } catch (err) {
        return res.json({ success: 0, message: err.message, data: [] });
    }
}
exports.booking_trend = async (req, res) => {
    try {
        const data = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$booking_date" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const responsedata = data.map(item => ({
            date: item._id,
            bookings: item.count
        }))
        res.json({ data: responsedata, success: 1 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: 0, message: err.message });
    }
}