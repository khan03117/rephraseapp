const { Router } = require("express");

const { Auth } = require("../middleware/Auth");
const { start_meet } = require("../controllers/AgoraController");

const router = Router();

router.post('/start', Auth, start_meet);

module.exports = router;