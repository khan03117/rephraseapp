const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { get_posts, write_post } = require("../controllers/PostleController");
const store = require("../middleware/Upload");

const router = Router();
router.get('/', Auth, get_posts);
router.post('/', Auth, store.fields([
    {
        name: "file",
        maxCount: "12"
    }
]), write_post);
module.exports = router;