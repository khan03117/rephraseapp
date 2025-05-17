const { Schema, model } = require("mongoose");
const FormSchema = new Schema({
    label: {
        type: String
    },
    input_type: {
        type: String
    }
})
const PrescriptionCategorySchema = new Schema({
    slug: {
        type: String
    },
    title: {
        type: String
    },
    order: {
        type: Number
    },
    form: [FormSchema],
}, { timestamps: true });

module.exports = new model('PrescriptionCategory', PrescriptionCategorySchema)