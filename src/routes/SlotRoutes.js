const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { get_slot, create_slot_by_weekdays, mark_holiday, deleteSlot, block_slot, create_single_slot, un_block_slot } = require("../controllers/SlotController");

const router = Router();
router.post('/', Auth, create_single_slot);
router.post('/by-weekdayname', Auth, create_slot_by_weekdays);
router.post('/holiday', Auth, mark_holiday);
router.post('/block', Auth, block_slot);
router.post('/unblock', Auth, un_block_slot);
router.get('/', Auth, get_slot);
router.delete('/delete/:id', Auth, deleteSlot);

module.exports = router;