const { Router } = require("express");
const { get_blog, create_blog, update_blog, delete_blog, latest_blog } = require("../controllers/BlogController");
const store = require("../middleware/Upload");
const { Auth } = require("../middleware/Auth");

const router = Router();
router.get('/', get_blog);
router.get('/latest', latest_blog);

router.post('/', Auth, store.fields([
    {
        name: "banner",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), create_blog);
router.put('/update/:id', Auth, store.fields([
    {
        name: "banner",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), update_blog);
router.delete('/delete/:id', Auth, delete_blog);
module.exports = router;