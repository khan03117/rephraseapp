const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { dashboard, booking_trend } = require("../controllers/AdminController");

const router = Router();
router.get('/dashboard', Auth, dashboard);
router.get('/booking-trend', Auth, booking_trend);
module.exports = router;