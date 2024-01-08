const { default: mongoose } = require("mongoose");


let siteSettingsScheme = new mongoose.Schema({
    referrer_bonus: String,
    referred_bonus: String,
})

let siteSettings = mongoose.model("site_settings", siteSettingsScheme);
module.exports = siteSettings;