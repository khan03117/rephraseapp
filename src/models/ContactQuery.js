const { Schema, model } = require("mongoose");

const schema = new Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    message: {
        type: String
    }
}, { timestamps: true });
module.exports = new model('ContactQuery', schema);