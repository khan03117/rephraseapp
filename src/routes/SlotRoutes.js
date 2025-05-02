const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { create_slot, get_slot, getAllSlots, create_slot_by_weekdays, mark_holiday } = require("../controllers/SlotController");

const router = Router();
router.post('/', Auth, create_slot);
router.post('/by-weekdayname', Auth, create_slot_by_weekdays);
router.post('/holiday', Auth, mark_holiday);
router.post('/block', Auth, block_slot);
router.get('/', get_slot);
router.get('/all', Auth, getAllSlots);
module.exports = router;