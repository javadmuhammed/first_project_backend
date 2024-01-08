

const mongoose = require("mongoose");


let UserModal = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    telegram_id: String,
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    referal_code: String,
    invited_code: String,
    profile_pic: String,
    password: String,
    status: String,
    is_suspended: Boolean,
    otp: Number,
    isOtpValidated: Boolean,
    otp_validity: Number,
    last_login: Date,
    number_orders_placed: {
        type: Number,
        default: 0
    },
    user_joined_date: {
        type: Number,
        default: Date.now,
    },
    joining_date: {
        type: Date,
        default: Date.now()
    },
    wallet_amount: {
        type: Number,
        default: 0
    },
    total_wallet_credit: {
        type: Number,
        default: 0
    },
    last_wallet_update: {
        type: String,
        default: ""
    },

    profile: String,
    total_used: Number,
    total_credit: Number,
    refresh_token: String,
    access_token: String,
    token: String,
    tokenExpire: Number,
    phone_number_update: {
        otp_number: Number,
        otp_expire: Number,
        new_number: Number,
        is_done: Boolean
    },
    email_token: {
        token: String,
        expire_time: String,
        is_done: Boolean,
        new_email: String
    },
    applied_coupen: {
        type: Array,
        default: []
    },
    individual_coupen: {
        type: Array,
        default: ["WELCOMEBONUS"]
    },
    extra_address_type: Array,
    is_delete: {
        type: Boolean,
        default: false
    }
})

const UserModalDb = mongoose.model("users", UserModal)

module.exports = UserModalDb;