// const { const_data } = require("../../../admin_panel/src/const/const_data");
const const_data = require("../../config/const.js");
const commonHelper = require("../../helper/CommonHelper/CommonHelper");
const userHelperMethod = require("../../helper/UserHelper/userHelperMethod");


let orderController = {
    getOrdersPagination: function (req, res) {
        let userid = req.body.userid;
        let page_number = req.params.page_number;
        let limit = req.params.limit;

        userHelperMethod.getUserOrdersPagination(userid, page_number, limit).then((order) => {
            console.log(order)
            res.send({ status: true, error: false, orders: order })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true })
        })

    },

    getOrders: function (req, res) {
        let userid = req.body.userid;
        userHelperMethod.getUserOrders(userid).then((order) => {
            res.send({ status: true, error: false, orders: order })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true })
        })
    },

    getSingleOrder: function (req, res) {
        let order_id = req.params.order_id;

        commonHelper.getSingleOrder(order_id).then((order) => {
            res.send({ status: true, error: false, order: order })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },


    getSingleOrderByNumber: (req, res) => {
        let order_number = req.params.order_number;


        commonHelper.getSingleOrderByNumber(order_number).then((order) => {
            res.send({ status: true, error: false, order: order })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },


    cancelOrder: (req, res) => {
        let user_id = req.body.userid;
        let order_id = req.body.order_id;

        commonHelper.getSingleOrder(order_id).then((orders_data) => {

            if (orders_data) {
                if (const_data.ORDER_STATUS.ORDER_RECEIVED == orders_data.status) {

                    if (orders_data.user_id == user_id) {
                        let updateDate = {
                            $set: {
                                status: const_data.ORDER_STATUS.CANCELED,
                            },
                            $push: {
                                shipping_history: {
                                    status: const_data.ORDER_STATUS.CANCELED,
                                    date: new Date()
                                }
                            }
                        }

                        commonHelper.update_order(order_id, updateDate).then((data) => {
                            res.send({ status: true, error: false, msg: "Cancel  has been submitted" })
                        }).catch((err) => {
                            res.send({ status: false, error: true, msg: "Something went wrong" })
                        })
                    } else {
                        res.send({ status: false, error: true, msg: "Invalid Authentication" })
                    }
                } else {
                    let msg = `Sorry, ${orders_data.status} products can't cancel`
                    res.send({ status: false, error: true, msg })
                }
            } else {
                res.send({ status: false, error: true, msg: "No order found" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    productReturnRequest: (req, res) => {
        let order_id = req.body.order_id;
        let user_id = req.body.userid;

        userHelperMethod.productReturnRequest(order_id, user_id).then((data) => {
            res.send({ status: true, error: false, msg: "Product return success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err ?? "Something went wrong" })
        })
    }
}

module.exports = orderController;