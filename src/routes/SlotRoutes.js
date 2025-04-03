const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { create_slot, get_slot } = require("../controllers/SlotController");

const router = Router();
router.post('/', Auth, create_slot);
router.get('/', get_slot);
module.exports = router;