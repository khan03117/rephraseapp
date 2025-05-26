const { Router } = require("express");
const { get_policies, _create } = require("../controllers/PolicyController");
const { Auth } = require("../middleware/Auth");

const router = Router();
router.get('/', get_policies);
router.post('/', Auth, _create);
module.exports = router;