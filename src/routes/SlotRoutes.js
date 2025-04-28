const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { create_slot, get_slot, getAllSlots, create_slot_by_weekdays } = require("../controllers/SlotController");

const router = Router();
router.post('/', Auth, create_slot);
router.post('/by-weekdayname', Auth, create_slot_by_weekdays);
router.get('/', get_slot);
router.get('/all', Auth, getAllSlots);
module.exports = router;