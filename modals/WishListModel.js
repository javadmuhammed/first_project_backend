

const mongoose = require("mongoose");


let wishListModal = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, required: true },
    product_id: { type: mongoose.Types.ObjectId, required: true, ref:"product" }
})

const WishlistModel = mongoose.model("wishlist", wishListModal)
module.exports = WishlistModel;