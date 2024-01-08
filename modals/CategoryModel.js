const { default: mongoose } = require("mongoose");


let categoryScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
    offer: {
        type: String,
        default: 0
    },
    category_inserted_date:{
        type: Date,
        default: new Date()
    }
})

let CategoryModel = mongoose.model('category', categoryScheme);
module.exports = CategoryModel;