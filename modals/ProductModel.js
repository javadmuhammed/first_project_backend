const { default: mongoose } = require("mongoose");
const ProductSchema = require("./ProductSchema");


let productModel = new mongoose.Schema(ProductSchema)

let ProductModel = mongoose.model("product", productModel);
module.exports = ProductModel;