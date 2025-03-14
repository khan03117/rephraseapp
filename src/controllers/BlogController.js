const Blog = require("../models/Blog");

const makeSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
exports.create_blog = async (req, res) => {
    try {
        const data = { ...req.body };
        const title = req.body.title;
        data['slug'] = makeSlug(title);
        if (req.files.banner) {
            data['banner'] = req.files.banner[0].path;
        }
        if (req.files.thumbnail) {
            data['thumbnail'] = req.files.thumbnail[0].path;
        }
        const resp = await Blog.create(data);
        return res.json({ success: 1, message: "Blog created successfull", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}
exports.get_blog = async (req, res) => {
    try {
        const { id, url } = req.query;
        const fdata = {}
        if (id) {
            fdata['_id'] = id;
        }
        if (url) {
            fdata['slug'] = url;
        }
        const resp = await Blog.find(fdata);
        return res.json({ success: 1, message: "Testimonial fetched successfull", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}

exports.update_blog = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        const title = req.body.title;
        data['slug'] = makeSlug(title);
        if (req.files.banner) {
            data['banner'] = req.files.banner[0].path;
        }
        if (req.files.thumbnail) {
            data['thumbnail'] = req.files.thumbnail[0].path;
        }
        const resp = await Blog.findOneAndUpdate({ _id: id }, { $set: data }, { new: true });
        return res.json({ success: 1, message: "Blog created successfull", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}
exports.delete_blog = async (req, res) => {
    try {
        const { id } = req.params;

        const resp = await Blog.deleteOne({ _id: id });
        return res.json({ success: 1, message: "Blog deleted successfull", data: resp });
    } catch (err) {
        return res.json({ success: 0, message: err.message });
    }
}