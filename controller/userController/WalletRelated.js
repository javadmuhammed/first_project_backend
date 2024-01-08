const commonHelper = require("../../helper/CommonHelper/CommonHelper");
const userHelperMethod = require("../../helper/UserHelper/userHelperMethod");


let WalletRelated = {

    getWalletHistory: function (req, res) {
        let userid = req.body.userid;

        commonHelper.getUserWalletHistory(userid).then((data) => {
            res.send({ status: true, error: false, history: data })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })

    },


    createWalletOrder: (req, res) => {
        let userid = req.body.userid;
        let amount = req.body.amount;
        let name = req.body.name
        let phone = req.body.phone;

        userHelperMethod.createWalletOrder(userid, amount, name, phone).then((order) => {
            res.send({ status: true, error: false, order_id: order.id })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true })
        })

    },


    verifyWalletOrder: (req, res) => {
        let userid = req.body.userid;
        let { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        userHelperMethod.verifyWalletOrder(userid,razorpay_payment_id, razorpay_order_id, razorpay_signature).then(() => {
            res.send({
                status: true, error: false, payment_data: {
                    razorpay_payment_id, razorpay_order_id, razorpay_signature
                }
            })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    }

}

module.exports = WalletRelated;
