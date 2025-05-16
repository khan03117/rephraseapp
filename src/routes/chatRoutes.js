const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { getOrCreateChatRoom, getMyAllRooms } = require("../controllers/chatRoomController");
const { get_chat_message, send_chat_message } = require("../controllers/ChatController");

const router = Router();
router.post('/room', Auth, getOrCreateChatRoom);
router.get('/room', Auth, getMyAllRooms);
router.post('/', Auth, get_chat_message);
router.post('/send', Auth, send_chat_message);
module.exports = router;