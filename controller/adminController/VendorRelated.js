const { default: mongoose } = require("mongoose");
const adminHelper = require("../../helper/AdminHelper/AdminHelper");
const VendorModelDB = require("../../modals/Vendor")


let vendorRelated = {

    getSingleVendor: (req, res) => {
        let vendor_id = req.body.admin_id;

        adminHelper.vendorFind({ _id: new mongoose.Types.ObjectId(vendor_id) }).then((vendor) => {
            res.send({ status: true, error: false, vendor })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },

    editAccount: (req, res) => {

        let email_address = req.body.email_address;
        let phone_number = req.body.phone_number;
        let vendor_id = req.body.admin_id;

        adminHelper.updateAccount(email_address, phone_number, vendor_id).then(() => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    }

}

module.exports = vendorRelated