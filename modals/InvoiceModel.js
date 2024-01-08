const { default: mongoose } = require("mongoose");
const { addressModel } = require("./AddressModel");


let InvoiceScheme = new mongoose.Schema({
    userid: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    is_number_verified: {
        type: Boolean,
        default: false,
    },
    otp_number: {
        type: Number,
        required: true
    },
    otp_expire: {
        type: Number,
        required: true
    },
    delivery_time: {
        type: String,
        default: null,
    },
    payment_method: {
        type: String,
        default: null,
    },
    payment_status: {
        type: String,
        default: null,
    },
    payment_id: {
        type: String,
        default: null,
    },
    payment_date: {
        type: String,
        default: null,
    },
    invoice_number: {
        type: String,
        required: true
    },
    invoice_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    original_amount: {
        type: Number,
        required: true
    },
    coupen_applied: {
        type: String, 
    },
    address: {
        type: addressModel,
        default: null,
    },
    order_placed: {
        type: Boolean,
        required: true,
    },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, required: true },
            quantity: Number,
            priceAtPurchaseOriginal: Number,
            priceAtPurchase: Number,
            variation: { type: Number, default: 1 }
        },
    ]
})


let InvoiceModel = mongoose.model("invoice", InvoiceScheme);
module.exports = InvoiceModel;