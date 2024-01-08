const commonHelper = require("../../helper/CommonHelper/CommonHelper");


let catgeoryController = {
    getAllCategory: async (req, res) => {

        // commonHelper.getAllCategory().then((category_data) => {
        //     res.send({ status: true, error: false, categorys: category_data })
        // }).catch((err) => {
        //     res.send({ status: false, error: true, msg: "Category fetching failed" })
        // })

        try {
            let categoryData = await commonHelper.getAllCategory();
            res.send({ status: true, error: false, categorys: categoryData })
        } catch (e) {
            res.send({ status: false, error: true, msg: "Category fetching failed" })
        }
    },

    getCategoryProduct: (req, res) => {

        let category_id = req.params.category_id;

        commonHelper.getCategoryProduct(category_id).then((data) => {
            res.send({ status: true, error: false, products: data })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },


    getCategoryMinimize: async (req, res) => {

        let count = req.params.count;
        let skip = req.params.skip;

        try {
            let categoryData = await commonHelper.getAllCategory(count, skip);
            if (categoryData) {
                res.send({ status: true, error: false, categorys: categoryData })
            } else {
                res.send({ status: false, error: true, msg: "Category fetching failed" })
            }
        } catch (e) {
            res.send({ status: false, error: true, msg: "Category fetching failed" })
        }

        // commonHelper.getAllCategory(count).then((category_data) => {
        //     res.send({ status: true, error: false, categorys: category_data })
        // }).catch((err) => {
        //     res.send({ status: false, error: true, msg: "Category fetching failed" })
        // })
    },


    getTopCategoryProduct: async (req, res) => {

        let category_limit = req.params.category_limit;
        let product_limit = req.params.product_limit;


        try {
            let categoryProduct = await commonHelper.getTopCategoryProduct(category_limit, product_limit);
            console.log(categoryProduct)
            if (categoryProduct) {
                res.send({ status: true, error: false, products: categoryProduct })
            } else {
                res.send({ status: false, error: true, msg: "Category product fetching failed" })
            }
        } catch (e) {
            res.send({ status: false, error: true, msg: "Category product fetching failed" })
        }
    }
}

module.exports = catgeoryController;