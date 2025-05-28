const Booking = require("../models/Booking");
const Prescription = require("../models/Prescription");
const PrescriptionCategory = require("../models/PrescriptionCategory");
const User = require("../models/User");

const makeSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
exports.create_category = async (req, res) => {
    try {
        const data = { ...req.body };
        const title = req.body.title;
        data['slug'] = makeSlug(title);
        const resp = await PrescriptionCategory.create(data);
        return res.json({ success: 1, message: "PrescriptionCategory created successfull", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}
exports.update_category = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        const title = req.body.title;
        data['slug'] = makeSlug(title);
        const resp = await PrescriptionCategory.findOneAndUpdate({ _id: id }, { $set: data });
        return res.json({ success: 1, message: "PrescriptionCategory created successfull", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}
exports.delete_category = async (req, res) => {
    const { id } = req.params;
    const resp = await PrescriptionCategory.deleteOne({ _id: id });
    return res.json({ success: 1, message: "PrescriptionCategory deleted successfull", data: resp });
}
exports.get_category = async (req, res) => {
    const { id, title } = req.query;
    const fdata = {};
    if (id) fdata['_id'] = id;
    if (title) fdata['title'] = title;
    const resp = await PrescriptionCategory.find(fdata).sort({ order: 1 })
    return res.json({ success: 1, message: "List of Category", data: resp });
}
exports.write_perscription = async (req, res) => {
    try {

        const { category, text, booking } = req.body;
        const checkCategory = await PrescriptionCategory.findOne({ _id: category });
        if (!checkCategory) {
            return res.json({ success: 0, message: "Invalid cateogry" });
        }
        const findBooking = await Booking.findOne({ _id: booking });
        if (!findBooking) {
            return res.json({ success: 0, message: "patient not found" });
        }
        const data = { category, booking, user: findBooking.user, text: [text], doctor: req.user._id, text_type: "array" };
        const isExist = await Prescription.findOne({ category, booking });
        let resp;
        if (isExist) {
            const ndata = {
                text: [...isExist.text, text],
                text_type: "array"
            }
            resp = await Prescription.findOneAndUpdate({ _id: isExist._id }, { $set: ndata }, { new: true });
        } else {
            resp = await Prescription.create(data);
        }


        return res.json({ success: 1, message: "Prescription created successfully", data: resp })
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }

}
exports.delete_perscription = async (req, res) => {
    try {
        const { id, index } = req.body;

        const prescription = await Prescription.findById(id);
        if (!prescription) {
            return res.status(404).json({ success: 0, message: "Prescription not found" });
        }

        // If only one text entry and index is 0, delete the entire document
        if (prescription.text.length == 1 && index == 0) {
            await Prescription.deleteOne({ _id: id });
            return res.json({
                success: 1,
                message: "Entire prescription deleted successfully",
            });
        }

        // Otherwise, remove the text entry at the given index
        if (index >= 0 && index < prescription.text.length) {
            prescription.text.splice(index, 1);
            prescription.markModified('text');
            await prescription.save();

            return res.json({
                success: 1,
                message: "Text entry deleted successfully",
                data: prescription,
            });
        } else {
            await Prescription.deleteOne({ _id: id });
            return res.json({
                success: 1,
                message: "Text entry deleted successfully",

            });
        }
    } catch (err) {
        return res.status(500).json({
            success: 0,
            message: "Internal server error",
            error: err.message,
        });
    }
};

exports.update_perscription = async (req, res) => {
    const { text, index } = req.body;
    const { id } = req.params;
    const checkPrescription = await Prescription.findOne({ _id: id });
    if (!checkPrescription) {
        return res.json({ success: 0, message: "Invalid prescription id" });
    }
    checkPrescription.text[index] = text;
    await checkPrescription.save();
    // const resp = await Prescription.findOneAndUpdate({ _id: id }, { $set: data });
    return res.json({ success: 1, message: "Prescription updated successfully" })
}
exports.get_perscription = async (req, res) => {
    try {
        const { user, doctor, type, booking_id, category, print_only } = req.query;
        const userId = req.user ? req.user?._id : null;
        const role = req.user ? req.user?.role : null;
        const fdata = {};
        if (category) {
            fdata['category'] = category
        }
        if (print_only) {
            fdata['category'] = { $in: print_only.split(',') }
        }
        if (role == "User") {
            fdata['user'] = userId;
            fdata['show_to_patient'] = true;
        }
        if (booking_id) {
            fdata['booking'] = booking_id;
        }
        if (role == "Doctor") {
            fdata['doctor'] = userId
        }
        if (user) {
            fdata['user'] = user
        }
        if (doctor) {
            fdata['doctor'] = doctor;
        }
        if (type) {
            fdata['type'] = type
        }
        const resp = await Prescription.find(fdata).populate({
            path: 'doctor',
            select: 'custom_request_id name mobile gender dob address role profile_image'
        }).populate({
            path: "user",
            select: 'custom_request_id name mobile gender dob address role profile_image'
        }).populate('category')
        return res.json({ success: 1, message: "List of prescriptions", data: resp, fdata });
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }
}
exports.upload_old_perscription = async (req, res) => {
    try {
        const { booking } = req.body;
        if (!booking) {
            return res.status(403).json({ success: 0, message: "Booking ID not found", data: null })
        }
        const findbooking = { _id: booking };
        if (req.user.role == "User") {
            findbooking['user'] = req.user._id;
        }
        const bookingdata = await Booking.findOne(findbooking);
        if (!bookingdata) {
            return res.status(403).json({ success: 0, message: "Booking not found", data: null })
        }
        const data = { ...req.body, user: req.user._id, type: "old", doctor: bookingdata.doctor };

        if (req.file) {
            data['file'] = req.file.path
            const uploadedpers = await Prescription.create(data);
            return res.json({
                errors: [],
                success: 1,
                message: "Prescription uploaded successfully",
                data: uploadedpers
            });
        } else {
            return res.json({
                errors: [{ path: 'image', msg: 'Image is required' }],
                success: 0,
                message: "Image is required",
                data: []
            });
        }
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }
}

exports.show_categories_perscription_to_user = async (req, res) => {
    try {
        const { print_only, booking_id } = req.body;
        if (!print_only) {
            return res.json({ success: 0, message: "print_only is required" });
        }
        const findBooking = await Booking.findOne({ _id: booking_id, doctor: req.user._id });
        if (!findBooking) {
            return res.json({ success: 0, message: "Invalid booking id" });
        }
        const preitems = await Prescription.find({ booking: booking_id });
        if (preitems.length == 0) {
            return res.json({ success: 0, message: "No prescription found" })
        }
        const data = {
            booking: booking_id,
            category: {
                $in: print_only.split(',')
            }
        }
        await Prescription.updateMany(data, { $set: { show_to_patient: true } });
        return res.json({ success: 1, message: "Data updated successfully" });
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }
}
