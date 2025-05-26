const { Router } = require("express");
const { _create, getAll, destroy } = require("../controllers/FaqController");
const { Auth } = require("../middleware/Auth");

const router = Router();
router.get('/', getAll);
router.post('/', _create);
router.delete('/destroy/:id', Auth, destroy);
module.exports = router;