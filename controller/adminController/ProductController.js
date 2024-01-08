const { default: mongoose } = require("mongoose");
const adminHelper = require("../../helper/AdminHelper/AdminHelper");
const { VENDOR_TYPE } = require("../../config/const");
const commonHelper = require("../../helper/CommonHelper/CommonHelper");

let productController = {

    getAllProduct: (req, res) => {
        commonHelper.getAllProduct({}).then((products) => {
            res.send({ status: true, error: false, products })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },


    getSingleProduct: (req, res) => {

        let productID = req.params.product_id;
        commonHelper.getSingleProduct({ _id: new mongoose.Types.ObjectId(productID) }).then((product) => {
            res.send({ status: true, error: false, product })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },


    addProduct: (req, res) => {


        console.log(req.body)
        let reqProduct = req.body;
        let adminID = req.body.admin_id;


        adminHelper.vendorFind({ _id: new mongoose.Types.ObjectId(adminID) }).then((vendor) => {


            if (vendor) {
                let productData = {
                    name: reqProduct.name,
                    small_description: reqProduct.small_description,
                    sale_price: reqProduct.sale_price,
                    original_price: reqProduct.original_price,
                    category: reqProduct.category,
                    extra_description: reqProduct.extra_description,
                    description: reqProduct.description,
                    key_features: reqProduct.key_features?.split(",") ?? reqProduct.key_features,
                    specifications: reqProduct.specifications?.split(",") ?? reqProduct.specifications,
                    stock: reqProduct.stock,
                    status: reqProduct.status,
                    images: reqProduct.images?.split(",") ?? reqProduct.images,
                    uploaded_by: vendor.isAdmin ? VENDOR_TYPE.ADMIN : VENDOR_TYPE.SUB_ADMIN,
                    uploader_id: vendor._id,
                    uploader_name: vendor.username,
                    option: reqProduct.option
                }


                console.log(productData)
                // res.send({ status: true, error: false, msg: "Product inserted success" })

                adminHelper.addProduct(productData).then((data) => {
                    res.send({ status: true, error: false, msg: "Product inserted success" })
                }).catch((err) => {
                    res.send({ status: false, error: true, msg: "Product inserted failed " + err })
                })
            } else {
                res.send({ status: false, error: true, msg: "Authentication Failed" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something Went Wrong " + err })
        })
    },

    safeDeleteProduct: (req, res) => {
        let productId = req.body.product_id?.split(",");
        adminHelper.updateManyProduct(productId, { isDelete: true }).then((data) => {
            res.send({ status: true, error: false, msg: "Product Deleted Success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Product Deleted Failed" })
        })
    },


    getOutofStockItems: (req, res) => {

        commonHelper.getProductByCondition({
            stock: {
                $lte: 50
            }
        }).then((products) => {
            res.send({ status: true, error: false, products })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Product Fetching Failed" })
        })
    },

    updateManyProduct: (req, res) => {
        console.log(req.body)
        let productId = req.body.product_id?.split(",");
        let newData = req.body.update_data;
        adminHelper.updateManyProduct(productId, { ...newData }).then((data) => {
            res.send({ status: true, error: false, msg: "Product Deleted Success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Product Deleted Failed" })
        })

    },

    updateProduct: (req, res) => {
        let productId = req.body.product_id;
        let newData = req.body.update_data;
        adminHelper.updateProduct(productId, { ...newData }).then((data) => {
            res.send({ status: true, error: false, msg: "Product Update Success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Product Update Failed " })
        })
    },


    updateStock: (req, res) => {
        let productId = req.body.product_id;
        let newStock = req.body.new_stock;

        adminHelper.updateStock(productId, newStock).then(() => {
            res.send({ status: true, error: false, msg: "Product Stock Update Success" })
        }).catch((err) => {
            res.send({ status: false, error: err, msg: "Product Stock Update Failed" })
        })
    },

    outOfStockProducts: (req, res) => {

        adminHelper.getOutOfStock().then((data) => {
            res.send({ status: true, error: false, products: data })
        }).catch((err) => {
            res.send({ status: false, error: err, msg: "Something went wrong" })
        })
    },

    soonOutOfStockProducts: (req, res) => {
        adminHelper.soonOutOfStock().then((data) => {
            res.send({ status: true, error: false, products: data })
        }).catch((err) => {
            res.send({ status: false, error: err, msg: "Something went wrong" })
        })
    },
}

module.exports = productController;