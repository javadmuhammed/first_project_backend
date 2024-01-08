
const adminHelper = require("../../helper/AdminHelper/AdminHelper");
const commonHelper = require("../../helper/CommonHelper/CommonHelper");

let categoryController = {
    addCategory: (req, res) => {



        let dataCategory = {
            name: req.body.name,
            image: req.body.image,
            status: req.body.status,
            offer: req.body.offer
        }

        adminHelper.addCategory(dataCategory).then((data) => {
            res.send({ status: true, error: false, msg: "Category created success" })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Category created failed" })
        })
    },

    getAllCategory: (req, res) => {

        commonHelper.getAllCategory().then((categorys) => {
            res.send({ status: true, error: false, categorys })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Category fetching failed" })
        })
    },

    updateCategory: (req, res) => {
        let updates_ids = req.body.update_ids?.split(",");
        let update_data = req.body.update_data;

        adminHelper.updateCategory(updates_ids, update_data).then(() => {
            res.send({ status: true, error: false, msg: "Category update success" })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Category update failed" })
        })
    },

    deleteCategory: (req, res) => {
        let delete_ids = req.body.delete_ids?.split(",");

        adminHelper.deleteCategory(delete_ids).then(() => {
            res.send({ status: true, error: false, msg: "Category delete success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Category delete failed" })
        })
    },

    getCategoryProduct: (req, res) => {
        let category_id = req.params.category_id;

        commonHelper.getProductByCategory(category_id).then((products) => {
            res.send({ status: true, error: false, products })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Category product fetching failed" })
        })
    },

    getSingleCategory: (req, res) => {
        let category_id = req.params.category_id;

        commonHelper.getSingleCategory(category_id).then((category) => {
            res.send({ status: true, error: false, category })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Category  fetching failed" })
        })
    },
}

module.exports = categoryController;