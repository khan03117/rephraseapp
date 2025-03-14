const { Schema, model } = require("mongoose");

const bookingSchema = new Schema({
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true // Index for faster queries
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true // Index for faster queries
    },
    booking_date: {
        type: Date, // Use Date type for better handling
    },
    start_at: {
        type: Date, // Use Date to store exact start time
    },
    end_at: {
        type: Date, // Use Date for exact end time
    }
}, { timestamps: true });

module.exports = model('Booking', bookingSchema); // Removed "new"
