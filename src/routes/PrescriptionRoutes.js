const { Router } = require("express");
const { get_category, create_category, delete_category, update_category, get_perscription, write_perscription, delete_perscription, update_perscription, upload_old_perscription } = require("../controllers/PrescriptionController");
const { Auth } = require("../middleware/Auth");
const store = require("../middleware/Upload");

const router = Router();
router.get('/category', get_category);
router.post('/category', create_category);
router.delete('/category/delete/:id', delete_category);
router.put('/category/update/:id', update_category);
router.get('/', Auth, get_perscription);
router.get('/print', get_perscription);
router.post('/', Auth, write_perscription);
router.post('/upload', Auth, store.single('image'), upload_old_perscription);
router.post('/delete', Auth, delete_perscription);
router.put('/update/:id', update_perscription);
module.exports = router;