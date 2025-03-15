const { Router } = require("express");
const { verify_otp, update_profile, user_list, send_otp } = require("../controllers/UserController");
const store = require("../middleware/Upload");
const { Auth } = require("../middleware/Auth");

const router = Router();
router.post('/send-otp', send_otp);
router.post('/verify-otp', verify_otp);
router.put('/update', Auth, store.fields([
    {
        name : "image",
        maxCount : 1
    },
    {
        name : "registration_certificate",
        maxCount : 1
    },
    {
        name : "graduation_certificate",
        maxCount : 1
    },
    {
        name : "post_graduation_certificate",
        maxCount : 1
    },
    {
        name : "mci_certificate",
        maxCount : 1
    }

]), update_profile);
router.get('/all', Auth, user_list);



module.exports = router;