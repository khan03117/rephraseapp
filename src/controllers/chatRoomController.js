const mongoose = require("mongoose");
const ChatRoom = require("../models/ChatRoom");

/**
 * Generate unique roomId based on 2 user ObjectIds (sorted strings)
 */
function generateRoomId(userId1, userId2) {
    return [userId1.toString(), userId2.toString()].sort().join("_");
}

const getOrCreateChatRoom = async (req, res) => {
    try {
        const from = req.user._id;
        const to = req.body.user;

        if (!from || !to) {
            return res.status(400).json({ error: "Both users IDs are required" });
        }

        if (from.toString() === to) {
            return res.status(400).json({ error: "User IDs must be different" });
        }

        const fromId = mongoose.Types.ObjectId(from);
        const toId = mongoose.Types.ObjectId(to);

        const roomId = generateRoomId(fromId, toId);

        let room = await ChatRoom.findOne({ roomId }).populate("users", "name email mobile");

        if (!room) {
            room = await ChatRoom.create({
                users: [fromId, toId].sort(),
                roomId,
            });
        }

        return res.status(200).json({ success: 1, message: "Room fetched/created successfully", data: room });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getOrCreateChatRoom };
