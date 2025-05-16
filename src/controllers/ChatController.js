const { emitter } = require("../../socket");
const Chat = require("../models/Chat");
const User = require("../models/User");

exports.send_chat_message = async (req, res) => {
    try {
        const { room_id, chat_message } = req.body;

        const sender_id = req.user._id;
        const sender = await User.findOne({ _id: sender_id });
        const data = {
            roomId: room_id,
            from: sender_id,
            text: chat_message,
            status: "Sent"
        };
        const messagesend = await Chat.create(data);

        emitter.emit('apiEvent', { ...data, sender: JSON.stringify(sender) })
        return res.status(201).json({
            success: 1,
            message: "Message sent successfully",
            data: messagesend,
        });
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
}

exports.get_chat_message = async (req, res) => {
    try {
        const { room_id } = req.body;
        const messages = await Chat.find({ roomId: room_id })
            .populate("from", "name email mobile profile_image")
            .populate({
                path: "roomId",
                select: "users",
                populate: {
                    path: "users",
                    select: "name email mobile profile_image",
                },
            })
            .sort({ timestamp: 1 });
        return res.json({ success: 1, message: "List of chat message", data: messages })
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
}