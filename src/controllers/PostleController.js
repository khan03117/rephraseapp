const UserPost = require("../models/UserPost");

exports.write_post = async (req, res) => {
    try {
        const files = req.files.file;
        console.log(files);
        const paths = files.map(fl => fl.path);
        const data = {
            how_was_day: req.body.how_was_day,
            user: req.user._id,
            text: req.body.text,
            files: paths,
            for_date: req.body.for_date
        }
        const resp = await UserPost.create(data);
        return res.json({ success: 1, message: "Created successfully", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }
}

exports.get_posts = async (req, res) => {
    try {
        const { page = 1, perPage = 10, for_date } = req.query;
        const fdata = {};
        if (for_date) {
            fdata['for_date'] = for_date
        }
        const totalDocs = await UserPost.countDocuments(fdata);
        const skip = (page - 1) * perPage;
        const totalPages = Math.ceil(totalDocs / perPage);
        const resp = await UserPost.find(fdata).sort({ createdAt: -1 }).skip(skip).limit(perPage);
        const pagination = { totalDocs, totalPages, perPage, page };
        return res.json({ success: 1, message: "List of posts written", data: resp, pagination });
    } catch (err) {
        return res.json({ success: 0, message: err.message })
    }
}