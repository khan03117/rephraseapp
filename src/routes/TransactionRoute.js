const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { get_transactions, create_transaction, update_transction, delete_transaction } = require("../controllers/BankTransctionController");

const router = Router();
router.get('/', Auth, get_transactions);
router.post('/', Auth, create_transaction);
router.put('/update/:id', Auth, update_transction);
router.delete('/delete/:id', Auth, delete_transaction);
module.exports = router;