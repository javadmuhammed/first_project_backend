
const commonHelper = require("../../helper/CommonHelper/CommonHelper");
let userHelper = require("../../helper/UserHelper/userHelperMethod")
let invoiceController = {
    placeInvoice: (req, res) => {
        let userid = req.body.userid;
        let address_id = req.body.address_id;

        userHelper.placeInvoice(userid, address_id).then((data) => {
            res.send({ status: true, error: false, msg: "Invoice Created" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Invoice Creation Failed " + err })
        })
    },


    getSingleInvoice: (req, res) => {
        let invoice_id = req.params.invoice_id;
        let userid = req.body.userid;

        userHelper.getSingleInvoice(invoice_id, userid).then((invoice) => {
            res.send({ status: true, error: false, invoice })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Invoice fetching failed" })
        })
    },


    createInvoice: (req, res) => {

        let userid = req.body.userid;
        let phone = req.body.phone;
        let address_id = req.body.selected_address;


        userHelper.placeInvoice(phone, userid, address_id).then((data) => {
            res.send({ status: true, error: false, msg: "Invoice created success", invoice_number: data })
        }).catch((err) => {
            res.send({ status: true, error: false, msg: "Something went wrong" })
        })
    },


    updateInvoicePhone: async (req, res) => {
        let userid = req.body.userid;
        let invoiceId = req.body.invoice_id;
        let phone_number = req.body.phone_number;

        try {
            if (await userHelper.updateInvoiceNumber(userid, invoiceId, phone_number)) {
                res.send({ status: true, error: false, msg: "Invoice updated success" })
            } else {
                res.send({ status: false, error: true, msg: "Invoice update failed" })
            }
        } catch (e) {
            res.send({ status: false, error: true, msg: "Invoice update failed" })
        }
    },


    updateOrderInvoice: async (req, res) => {
        let order_id = req.body.order_id;
        let user_id = req.body.userid;
        let invoice_data = req.body.invoice_data;
        let order_data = req.body.order_data;
        let invoice_id = req.body.invoice_id;


        console.log(req.body)


        try {
            let updateInvoiceOrder = await userHelper.updateOrderInvoice(order_id, invoice_id, user_id, invoice_data, order_data);
            if (updateInvoiceOrder) {
                res.send({ status: true, error: false, msg: "Invoice & Order updated success" })
            } else {
                res.send({ status: false, error: true, msg: "Invoice update failed1" })
            }
        } catch (e) {
            console.log(e)
            res.send({ status: false, error: true, msg: "Invoice update failed2" })
        }
    },


    updateInvoice: (req, res) => {
        let userid = req.body.userid;
        let invoiceId = req.body.invoice_id;
        let update_data = req.body.update_data;

        userHelper.updateInvoice(userid, invoiceId, update_data).then((data) => {
            res.send({ status: true, error: false, msg: "Invoice updated success", coupen: data?.coupen ?? false })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Invoice update failed" })
        })
    },

    resendOtpCode: (req, res) => {
        let userid = req.body.userid;
        let phoneNumber = req.body.phone;
        let invoice_id = req.body.invoice_id;

        userHelper.resendCheckoutVerificationOtp(userid, phoneNumber, invoice_id).then((data) => {
            res.send({ status: true, error: false, msg: "OTP resend success" })
        }).catch((err) => {
            res.send({ status: true, error: false, msg: err })
        })
    },


    invoicePhoneVerification: (req, res) => {
        let userid = req.body.userid;
        let otpField = req.body.otp;
        let phone = req.body.phone;
        let invoiceId = req.body.invoice_id;


        userHelper.invoicePhoneVerification(userid, otpField, phone, invoiceId).then((data) => {
            res.send({ status: true, error: false, msg: "Mobile number verified" })
        }).catch((err) => {
            res.send({ status: false, error: false, msg: err })
        })
    },


    downloadInvoice: (req, res) => {

        let invoice_id = req.body.invoice_id;


        

        commonHelper.downloadInvoice(invoice_id).then((docs) => {
            try {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
                console.log("Generated")
                res.send(docs);
            } catch (e) {
                res.send({ status: false, error: true, msg: "Invoice created failed 1" })
            }
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Invoice created failed 2" })
        })
    },
}

module.exports = invoiceController;