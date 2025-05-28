const { Schema, model } = require("mongoose");

const schema = new Schema({
    bank: {
        type: Schema.Types.ObjectId,
        ref: 'UserBank',
        default: null
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    transaction_date: {
        type: Date
    },
    transction_type: {
        type: String,
        default: "Credit"
    },
    amount: {
        type: Number
    },
    image: {
        type: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = new model('BankTransaction', schema);