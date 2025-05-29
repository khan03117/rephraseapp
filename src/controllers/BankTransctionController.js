const BankTransaction = require("../models/BankTransaction");

exports.create_transaction = async (req, res) => {
    try {
        const fields = ['bank', 'doctor', 'transaction_date', 'transaction_type', 'amount'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, errors: 'The following fields are required:', fields: emptyFields });
        }
        const data = { ...req.body };
        const resp = await BankTransaction.create(data);
        return res.json({ success: 1, message: "Bank transaction created successfully", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }
}

exports.update_transction = async (req, res) => {
    try {
        const { id } = req.params;
        const fields = ['bank', 'doctor', 'transaction_date', 'transction_type', 'amount'];
        const emptyFields = fields.filter(field => !req.body[field]);
        if (emptyFields.length > 0) {
            return res.json({ success: 0, errors: 'The following fields are required:', fields: emptyFields });
        }
        const data = { ...req.body };
        const resp = await BankTransaction.udpateOne({ _id: id }, { $set: data }, { new: true });
        return res.json({ success: 1, message: "Bank transaction updated successfully", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }
}
exports.delete_transaction = async (req, res) => {
    try {
        const { id } = req.params;

        const data = { is_deleted: true };
        const resp = await BankTransaction.updateOne({ _id: id }, { $set: data });
        return res.json({ success: 1, message: "User bank added successfully", data: resp });
    } catch (error) {
        return res.json({ success: 0, message: error.message })
    }
}

exports.get_transactions = async (req, res) => {
    try {
        const { doctor_id } = req.query;
        const fdata = {};
        if (req.user.role == "Doctor") {
            fdata['doctor'] = req.user._id
        }
        if (doctor_id) {
            fdata['doctor'] = doctor_id
        }
        const resp = await BankTransaction.find(fdata).populate('bank').populate('doctor');
        return res.json({ success: 1, message: "User bank fetched successfully", data: resp });
    } catch (error) {
        return res.json({ success: 0, message: error.message })
    }
}