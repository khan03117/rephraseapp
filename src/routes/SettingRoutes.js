const { Router } = require("express");
const { get_setting, create_setting, delete_setting, update_setting } = require("../controllers/SettingController");
const store = require("../middleware/Upload");
const { Auth } = require("../middleware/Auth");

const router = Router();
router.get('/', get_setting);
router.post('/', Auth, store.single('file'), create_setting);
router.delete('/delete/:id', Auth, delete_setting);
router.put('/update/:id', Auth, store.single('file'), update_setting);
module.exports = router;