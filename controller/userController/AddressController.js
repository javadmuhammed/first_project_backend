
const commonHelper = require("../../helper/CommonHelper/CommonHelper");
let userHelperMethod = require("../../helper/UserHelper/userHelperMethod")

let addressController = {
    getAddressList: function (req, res) {
        let user_id = req.body.userid;

        userHelperMethod.getAddressList(user_id).then((address) => {
            res.send({ status: true, error: false, address })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },


    sampleController: (req, res) => {

        let userid = req.body.user_id;


    },


    addAddress: function (req, res) {
        let user_id = req.body.userid;

        let address = req.body.address;
        address.user_id = user_id;

        console.log(req.body)

        userHelperMethod.addAddress(address, user_id).then((data) => {
            console.log(data)
            res.send({ status: true, error: false, address_id: data._id })
        }).catch((err) => { 
            console.log(err)
            res.send({ status: false, error: true, msg: err})
        })


    },


    editAddress: function (req, res) {
        let user_id = req.body.userid;
        let address_id = req.body.address_id;

        let address = req.body.address;


        userHelperMethod.updateAddress(address, user_id, address_id).then((data) => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })

    },


    deleteAddress: function (req, res) {
        let user_id = req.body.userid;
        let address_id = req.params.address_id;


        console.log(user_id, address_id)

        userHelperMethod.deleteAddress(address_id, user_id).then((data) => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },


    getSingleAddress: (req, res) => {
        let address_id = req.params.address_id;
        console.log(address_id)
        commonHelper.getSingleAddress(address_id).then((data) => {
            res.send({ status: true, error: false, data })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" + err })
        })
    },


    setAddressPrimary: (req, res) => {
        let user_id = req.body.userid;
        let address_id = req.body.address_id;

        userHelperMethod.setAddressAsPrimary(user_id, address_id).then(() => {
            res.send({ status: true, error: false, msg: "Address successfully set as primary" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    addNewAddressType: (req, res) => {
        let user_id = req.body.userid;
        let address_type = req.body.address_type;

        userHelperMethod.addNewAddressType(address_type, user_id).then(() => {
            res.send({ status: true, error: false, msg: "Address type added success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err })
        })
    }
}

module.exports = addressController;