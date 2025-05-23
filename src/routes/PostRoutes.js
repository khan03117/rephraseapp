const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { get_posts, write_post } = require("../controllers/PostleController");

const router = Router();
router.get('/', Auth, get_posts);
router.post('/', Auth, write_post);
module.exports = router;