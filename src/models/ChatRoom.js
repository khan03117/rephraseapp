const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
    roomId: {
        type: String
    },
    users: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

chatRoomSchema.index({ users: 1 }, { unique: false });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
