const { Router } = require("express");
const { Auth } = require("../middleware/Auth");
const { get_transactions, create_transaction, update_transction, delete_transaction } = require("../controllers/BankTransctionController");

const router = Router();
router.get('/transaction', Auth, get_transactions);
router.post('/transaction', Auth, create_transaction);
router.put('/transaction/:id', Auth, update_transction);
router.delete('/transaction/:id', Auth, delete_transaction);
module.exports = router;