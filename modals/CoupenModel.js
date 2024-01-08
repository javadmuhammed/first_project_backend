const { default: mongoose } = require("mongoose");

let coupenScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique:true
    },
    description: {
        type: String,
        required: true,
    },
    offer: {
        type: Number,
        required: true,
    },
    is_percentage: {
        type: Boolean,
        required: true,
    },
    createdBy: {
        type: String,
        enum: ['ADMIN', 'AUTO'],
        required: true,
    },
    individual_user: {
        type: Array,
        required: [],
    },
    minimum_order: {
        type: Number,
        required: true,
    },
    maximum_order: {
        type: Number,
        required: true,
    },
    valid_from: {
        type: Date,
        required: true,
    },
    valid_to: {
        type: Date,
        required: true,
    },
    used_count: {
        type: Number,
        default: 0
    },
    inserted_date: {
        type: Date,
        default: new Date()
    },
    status: {
        type: Boolean,
    }
})

let coupenModel = mongoose.model("coupen", coupenScheme);
module.exports = coupenModel;
