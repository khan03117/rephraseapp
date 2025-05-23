const { Schema, model } = require("mongoose");

const schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
    },
    files: {
        type: [String]
    },
    voices: {
        type: [String]
    },
    for_date: {
        type: Date
    },
    how_was_day: {
        type: String
    }

}, { timestamps: true });

module.exports = new model('UserPost', schema);