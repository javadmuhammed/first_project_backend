const { default: mongoose } = require("mongoose");

let SchemeBanner = new mongoose.Schema({
    name: { required: true, type: String },
    url: { required: true, type: String },
    status: { required: true, type: Boolean },
    images: { required: true, type: String },
})

let BannerModel = mongoose.model("banner", SchemeBanner);
module.exports = BannerModel;
 