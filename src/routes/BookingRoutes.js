const { Router } = require("express");
const { create_booking } = require("../controllers/BookingController");
const { Auth } = require("../middleware/Auth");

const router = Router();
router.post('/', Auth, create_booking);

module.exports = router;