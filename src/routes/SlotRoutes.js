const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { create_slot } = require("../controllers/SlotController");

const router = Router();
router.post('/', Auth, create_slot);
module.exports = router;