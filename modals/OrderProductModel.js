const mongoose = require("mongoose")
const ProductSchema= require("./ProductSchema")
// import ProductSchema from "./ProductSchema";

let orderProductSchema = new mongoose.Schema({
    ...ProductSchema, order_id: {
        type: String,
        required: true,
    }
});
let OrderProduct = mongoose.model("order_product", orderProductSchema, "order_products")

module.exports = OrderProduct