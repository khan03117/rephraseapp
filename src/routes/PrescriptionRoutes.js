const { Router } = require("express");
const { get_category, create_category, delete_category, update_category, get_perscription, write_perscription, delete_perscription, update_perscription } = require("../controllers/PrescriptionController");

const router = Router();
router.get('/category', get_category);
router.post('/category', create_category);
router.delete('/category/delete/:id', delete_category);
router.put('/category/update/:id', update_category);
router.get('/', get_perscription);
router.post('/', write_perscription);
router.delete('/delete/:id', delete_perscription);
router.put('/update/:id', update_perscription);
module.exports = router;