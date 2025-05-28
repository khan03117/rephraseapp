const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { handle_specility, get_specility, getDoctorWithSpecialization, clinics, add_patient, handleActive, add_bank, update_bank, delete_bank } = require("../controllers/DoctorController");

const router = Router();
router.post('/specility/:doctor_id', Auth, handle_specility);
router.get('/specility/:doctor_id', Auth, get_specility);
router.get('/', getDoctorWithSpecialization);
router.get('/clinics', Auth, clinics);
router.put('/update/:id', Auth, handleActive);
router.post('/create-booking', Auth, add_patient);


router.post('/bank', Auth, add_bank);
router.put('/bank/update/:id', Auth, update_bank);
router.delete('/bank/delete/:id', Auth, delete_bank);

module.exports = router;