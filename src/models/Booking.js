const { Schema, model } = require("mongoose");

const bookingSchema = new Schema({
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    booking_date: {
        type: Date,
    },
    start_at: {
        type: Date,
    },
    end_at: {
        type: Date,
    },
    duration: {
        type: Number
    },
    language: {
        type: String
    },
    mode: {
        type: String,
        enum: ['Online', 'Offline'],
        default: "Online"
    },
    consultation_charge: {
        type: Number
    },
    booked_slot: {
        type: Schema.Types.ObjectId,
        ref: "Slot",
        default: null
    },

    status: {
        type: String //Completed, Cancelled, Booked
    },
    is_completed: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: "Pending"
    },
    agora_token: {
        type: Schema.Types.Mixed
    },
    agora_token_generated_at: {
        type: Date
    },
    call_status: {
        type: String
    },
    order_id: {
        type: String
    },
    payment_gateway_request: {
        type: Schema.Types.Mixed
    },
    payment_gateway_response: {
        type: Schema.Types.Mixed
    },
    payment_status: {
        type: String,
        default: "Pending"
    }

}, { timestamps: true });

module.exports = model('Booking', bookingSchema); // Removed "new"
