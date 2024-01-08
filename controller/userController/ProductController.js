const { default: mongoose } = require("mongoose");
const commonHelper = require("../../helper/CommonHelper/CommonHelper");


let productController = {
    getAllProduct: (req, res) => {
        commonHelper.getAllProduct({ status: true, isDelete: false, is_category_active: true }).then((products) => {
            res.send({ status: true, error: false, products })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },

    getSingleProduct: (req, res) => {

        let productID = req.params.product_id;

        commonHelper.getSingleProduct({ _id: new mongoose.Types.ObjectId(productID), status: true, isDelete: false, is_category_active: true }).then((product) => {
            res.send({ status: true, error: false, product })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
        
    },



    getProductOption: (req, res) => {

        let option = req.params.option;
        let limit = req.params.limit;
        let userid = req.body.userid;

        commonHelper.getProductOption(limit, userid, { option, status: true, isDelete: false, is_category_active: true }).then((data) => {
            res.send({ status: true, error: false, product: data })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err })
        })
    },

    filterProduct: (req, res) => {

        let sort = req.body.sort;
        let betweenFrom = req.body.between_from;
        let betweenTo = req.body.between_to;
        let category = req.body.category_id;
        let optionCategory = req.body.option;

        commonHelper.filterProduct(sort, betweenFrom, betweenTo, category, optionCategory).then((productList) => {
            res.send({ status: true, error: false, product: productList })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err })
        })
    }


}

module.exports = productController;