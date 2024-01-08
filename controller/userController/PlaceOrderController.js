let userHelper = require("../../helper/UserHelper/userHelperMethod")

let placeOrderController = {
    placeOrder: (req, res) => {
        let invoice_id = req.body.invoice_id;
        let payment_type = req.body.payment_type;

        userHelper.placeOrder(invoice_id, payment_type).then((data) => {
            res.send({ status: true, error: false, msg: "Cart Checkout Success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err })
        })
    },

    razorpayOrder: (req, res) => {

        let invoice_id = req.body.invoice_id;

        userHelper.createRazorOrder(invoice_id).then((data) => {
            res.send({ status: true, error: false, order: data })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })



    },

    verifyRazorpay: (req, res) => {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;


        userHelper.verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature).then((dt) => {
            res.send({
                status: true, error: false, msg: "Payment success", payment_data: {
                    order_id: razorpay_order_id, payment_id: razorpay_payment_id, signature: razorpay_signature
                }
            })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Payment failed" })
        })
    },
}

module.exports = placeOrderController;