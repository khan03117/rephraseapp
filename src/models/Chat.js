const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatRoom",
        required: true,
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,

    },
    status: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

chatSchema.index({ roomId: 1, timestamp: 1 });

module.exports = mongoose.model("Chat", chatSchema);
