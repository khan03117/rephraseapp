const Video = require("../models/Video");

const makeSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

exports.create_video = async (req, res) => {
    console.log(req.files)
    const { title } = req.body;
    const url = makeSlug(title);
    const data = { ...req.body };
    data['url'] = url;
    if (req.files.banner) {
        data['banner'] = req.files.banner[0].path;
    }
    if (req.files.thumbnail) {
        data['thumbnail'] = req.files.thumbnail[0].path;
    }
    if (req.files.video) {
        data['video'] = req.files.video[0].path;
        data['source'] = "local"
    }
    const resp = await Video.create(data);
    return res.json({ success: 1, message: "Data uploaded successfully", data: resp })

}
exports.get_video = async (req, res) => {
    const { page_name } = req.params;
    const { id, url } = req.query;
    const fdata = { page_section: page_name };
    const resp = await Video.find();
    return res.json({ success: 1, data: resp, message: "List of videos" });

}
exports.delete_video = async (req, res) => {
    const { id } = req.params;
    const resp = await Video.deleteOne({ _id: id });
    return res.json({ success: 1, message: "Deleted successfully", data: resp });
}
exports.update_video = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const url = makeSlug(title);
    const data = { ...req.body };
    data['url'] = url;
    if (req.files.banner) {
        data['banner'] = req.files.banner[0].path;
    }
    if (req.files.thumbnail) {
        data['thumbnail'] = req.files.thumbnail[0].path;
    }
    if (req.files.video) {
        data['thumbnail'] = req.files.video[0].path;
    }
    const resp = await Video.findOneAndUpdate({ _id: id }, { $set: data });
    return res.json({ success: 1, message: "Data uploaded successfully", data: resp })
}