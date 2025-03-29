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
                    enum: ['morning', 'noon', 'evening'],
                    default: null
                },
                start_time: {
                    type: Date,
                },
                end_time: {
                    type: Date,
                },
                time_slots: {
                    type: [String]
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
            enum: ["Partial", "Full"],
            default: null
        },
        block_at: {
            type: Date
        }
    },
    { timestamps: true }
);

module.exports = model("Slot", slotSchema);
