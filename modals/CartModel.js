const mongoose = require("mongoose");

let cartModel = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    products: [
        {
            product_id: {
                type: mongoose.Types.ObjectId,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            variation: {
                type: Number,
                default: 1.00,
            },
        },
    ],
});




let CartModel = mongoose.model("cart", cartModel, "cart");
module.exports = CartModel;
