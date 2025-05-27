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
        const fromId = req.user._id;
        const toId = req.body.user;


        // const fromId = mongoose.Types.ObjectId(from);
        // const toId = mongoose.Types.ObjectId(to);
        if (fromId == toId) {
            return res.status(404).json({ success: 0, message: "Select a valid receipt" })
        }
        const roomId = generateRoomId(fromId, toId);

        let room = await ChatRoom.findOne({ roomId }).populate("users", "name email mobile");

        if (!room) {
            const createdroom = await ChatRoom.create({
                users: [fromId, toId].sort(),
                roomId,
            });
            room = await ChatRoom.findOne({ _id: createdroom._id }).populate("users", "name email mobile");
        }
        return res.status(200).json({ success: 1, message: "Room fetched/created successfully", data: room });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
const getMyAllRooms = async (req, res) => {
    try {
        const userId = req.user._id;
        const rooms = await ChatRoom.find({ users: userId })
            .populate("users", "name email mobile profile_image")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: 1,
            data: rooms,
        });

    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getOrCreateChatRoom, getMyAllRooms };
