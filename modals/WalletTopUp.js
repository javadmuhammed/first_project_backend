const { default: mongoose } = require("mongoose");

let WalletTopUp = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    order_id: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date()
    }
})

let WalletTopUpModel = mongoose.model("wallet_topup", WalletTopUp, "wallet_topup")
module.exports = WalletTopUpModel