

const mongoose = require("mongoose");
const { addressModel } = require("./AddressModel");
const { ORDER_STATUS } = require("../config/const");


let orderModel = new mongoose.Schema({
    order_id: { type: String, required: true },
    order_date: { type: Date, required: true },
    order_stamp: { type: Number, default: Date.now },
    shipper_name: { type: String, required: true },
    total: { type: String, required: true },
    status: { type: String, required: true },
    address: { type: addressModel, required: true },
    user_id: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
    invoice_id: { type: String, required: true },
    invoice_number: { type: String, required: true },
    payment_type: { type: String, required: true },
    shipping_history: {
        type: [],
        default: [{
            status: ORDER_STATUS.ORDER_RECEIVED,
            date: new Date()
        }]
    },
    products: {
        product: { type: mongoose.Types.ObjectId, required: true, ref: "product" },
        quantity: Number,
        variation: { type: Number },
        category: { type: mongoose.Types.ObjectId, required: true, ref: "category" },
        sub_total: { type: Number, required: true },
        total: { type: Number, required: true },
        discount: { type: Number, required: true },
    },
    delivery_time: {
        type: String,
        default: null,
    },
})

const OrdersModalDb = mongoose.model("orders", orderModel)
module.exports = OrdersModalDb;