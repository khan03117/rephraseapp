const { Schema, model } = require("mongoose");

const schema = new Schema({
    title  : {
        type : String,
    },
    icon : {
        type : String
    }
});
module.exports = new model('Specialization', schema);