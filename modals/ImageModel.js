const { default: mongoose } = require("mongoose");


let ImageScheme = new mongoose.Schema({
    image: {
        required: true,
        type: String
    },
    file_size: {
        required: true,
        type: String
    },
    image_inserted_date: {
        type: Date,
        default: Date.now()
    },
})

let ImageModel = mongoose.model("images", ImageScheme);
module.exports = ImageModel;