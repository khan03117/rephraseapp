const { Schema, model } = require("mongoose");

const slotSchema = new Schema(
    {
        doctor: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        date: {
            type: Date,
        },
        availability: [
            {
                slot: {
                    type: String,
                    //enum: ["08:00 AM - 10:00 AM", "10:30 AM - 12:30 PM", "02:00 PM - 04:00 PM"],
                },
                start_time: {
                    type: Date,
                },
                end_time: {
                    type: Date,
                },
                status: {
                    type: String,
                    enum: ["available", "unavailable"],
                    default: "available"
                }
            }
        ],
        slot_type: {
            type: String,
            enum: ["Block", "Available"],
        },
        block_type: {
            type: String,
            enum: ["Partial", "Full"]
        },
        block_at: {
            type: Date
        }
    },
    { timestamps: true }
);

module.exports = model("Slot", slotSchema);
