
const adminHelper = require("../../helper/AdminHelper/AdminHelper");  
const { ORDER_STATUS } = require("../../config/const");
const commonHelper = require("../../helper/CommonHelper/CommonHelper"); 
const userHelperMethod = require("../../helper/UserHelper/userHelperMethod");
 

let ordersController = {
    getOrderList: (req, res) => {
        adminHelper.getAllOrders().then((data) => {
            res.send({ status: true, error: false, orders: data })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    getOrderbyProductID: (req, res) => {
        let product_id = req.params.product_id;
        console.log(product_id)

        adminHelper.getOrdersByProductID(product_id).then((orders) => {
            res.send({ status: true, error: false, orders: orders })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },


    getUserOrder : (req,res)=>{ 
        let user_id = req.params.user_id;

        adminHelper.getOrdersByUser(user_id).then((orders)=>{
            res.send({ status: true, error: false, orders: orders })
        }).catch((err) => { 
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    getSingleOrder: (req, res) => {
        let order_id = req.params.order_id
        commonHelper.getSingleOrder(order_id).then((data) => {
            res.send({ status: true, error: false, order: data })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    updateOrder: (req, res) => {
        let order_id = req.body.order_id;
        let newStatus = req.body.new_status;

        let isFind = Object.keys(ORDER_STATUS).includes(newStatus)
      //  let nextStatus = userHelperMethod.checkOrderUpdateNextStatus(ORDER_STATUS[newStatus])


      

        if (!isFind) {
            console.log("This work")
            res.send({ status: false, error: true, msg: "Something went wrong" })
            return;
        }

        newStatus = ORDER_STATUS[newStatus];

        let updateData = {
            status: newStatus,
            $push: {
                shipping_history: {
                    status: newStatus,
                    date: new Date()
                }
            }
        }

        console.log(updateData)


        adminHelper.updateOrder(order_id, updateData).then((data) => {
            res.send({ status: true, error: false, msg: "Order Update Status" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong " })
        })


    },
}

module.exports = ordersController;