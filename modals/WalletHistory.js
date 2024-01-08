const mongoose = require("mongoose");


let walletModel = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    wallet_details: [
        {
            date: {
                type: Date,
                required: true
            },
            payment_id: {
                type: String
            },
            amount: {
                type: Number,
                required: true
            },
            via: {
                type: String,
                required: true
            },
            withdraw: {
                type: Boolean,
                required: true
            },
        },
    ]
})


let ModalWallet = mongoose.model("wallet_history", walletModel, "wallet_history");
module.exports = ModalWallet;