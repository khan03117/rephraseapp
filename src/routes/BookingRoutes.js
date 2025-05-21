const { Router } = require("express");
const { create_booking, get_booking, cancel_booking, update_booking, update_payment_status } = require("../controllers/BookingController");
const { Auth } = require("../middleware/Auth");

const router = Router();
router.post('/', Auth, create_booking);
router.get('/', Auth, get_booking);
router.post('/cancel', Auth, cancel_booking);
router.put('/reschedule', Auth, update_booking);
router.get('/payment/:orderId', update_payment_status);

module.exports = router;