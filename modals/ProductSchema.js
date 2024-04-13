
const mongoose = require("mongoose")

module.exports= {
    name: { type: String, required: true },
    small_description: { type: String, required: true },
    sale_price: { type: Number, required: true },
    original_price: { type: Number, required: true },
    images: { type: Array, required: true },
    category: { type: mongoose.Types.ObjectId, required: true, ref: "category" },
    product_inserted_date: {
        type: Date,
        default: Date.now()
    },
    number_of_orders: {
        type: Number,
        default: 0
    },
    product_inserted_date :{
        type: Date,
        default: new Date()
    },
    is_category_active: { type: Boolean, default: true },
    extra_description: { type: String, required: true },
    description: { type: String, required: true },
    key_features: { type: Array, required: true },
    specifications: { type: Array, required: true },
    stock: { type: Number, required: true },
    uploaded_by: { type: String, required: true },
    uploader_id: { type: String, required: true },
    uploader_name: { type: String, required: true },
    status: { type: Boolean, default: true },
    option: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
}