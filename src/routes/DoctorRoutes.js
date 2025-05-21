const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { handle_specility, get_specility, getDoctorWithSpecialization, clinics, add_patient, handleActive } = require("../controllers/DoctorController");

const router = Router();
router.post('/specility/:doctor_id', Auth, handle_specility);
router.get('/specility/:doctor_id', Auth, get_specility);
router.get('/', getDoctorWithSpecialization);
router.get('/clinics', Auth, clinics);
router.put('/update/:id', Auth, handleActive);
router.post('/create-booking', Auth, add_patient);

module.exports = router;