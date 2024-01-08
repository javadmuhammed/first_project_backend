const commonHelper = require("../../helper/CommonHelper/CommonHelper");
const userHelperMethod = require("../../helper/UserHelper/userHelperMethod");


let coupenController = {

    getAllCoupenCode: (req, res) => {

        commonHelper.getAllCoupenCode().then((coupenList) => {
            res.send({ status: true, error: false, coupen: coupenList })
        }).catch((err) => {
            res.send({ status: true, error: false })
        })
    },

    applayCoupenCode: async (req, res) => {
        let coupen_code = req.params.coupen_code;
        let invoice_id = req.params.invoice_id;
        let user_id = req.body.userid;

        try {
            let applyCoupenCode = await userHelperMethod.applyCoupenCode(coupen_code, invoice_id, user_id);
            res.send({ status: true, error: false, coupen_status: applyCoupenCode })
        } catch (e) {
            res.send({ status: true, error: false, msg: "Something went wrong" })
        }


    }

}

module.exports = coupenController;