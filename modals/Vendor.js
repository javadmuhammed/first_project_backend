const { default: mongoose } = require("mongoose");


let VendorModel = new mongoose.Schema({
    username: String,
    first_name: String,
    last_name: String,
    isAdmin: Boolean,
    status: Boolean,
    permissions: Array,
    profile: String,
    mobile: String,
    email: String,
    password: String,
    access_token: String,
    token: String,
    tokenExpire: Number,
    vendor_created_date: {
        type: Date,
        default: Date.now()
    },
    email_token: {
        token: String,
        expire_time: String,
        is_done: Boolean,
        new_email: String
    },
    phone_token: {
        otp: String,
        expire_time: String,
        is_done: Boolean,
        new_phone: String
    }
})


let VendorModelDB = mongoose.model("vendor", VendorModel);
module.exports = VendorModelDB