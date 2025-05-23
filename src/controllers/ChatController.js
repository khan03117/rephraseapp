const { emitter } = require("../../socket");
const Chat = require("../models/Chat");
const User = require("../models/User");
const moment = require("moment-timezone");
exports.send_chat_message = async (req, res) => {
    try {
        const { room_id, chat_message } = req.body;
        const sender_id = req.user._id;
        const sender = await User.findOne({ _id: sender_id }).select('name email mobile profile_image');
        const data = {
            roomId: room_id,
            from: sender_id,
            text: chat_message,
            status: "Sent"
        };
        const messagesend = await Chat.create(data);
        emitter.emit('apiEvent', { ...data, from: sender, timestamp: moment().format('YYYY-MM-DD HH:mm:ss') })
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
        const { room_id, page = 1, perPage = 10 } = req.body;
        const fdata = {
            roomId: room_id
        }
        const totalDocs = await Chat.countDocuments(fdata);
        const totalPages = Math.ceil(totalDocs / perPage);
        const skip = (page - 1) * perPage;
        const pagination = { totalDocs, totalPages, perPage, page };
        const messages = await Chat.find(fdata)
            .populate("from", "name email mobile profile_image")
            .sort({ timestamp: 1 }).skip(skip).limit(perPage);
        return res.json({ success: 1, message: "List of chat message", data: messages, pagination })
    } catch (err) {
        return res.status(500).json({ success: 0, message: err.message });
    }
}