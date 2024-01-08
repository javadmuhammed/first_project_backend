const adminHelper = require("../../helper/AdminHelper/AdminHelper");
const commonHelper = require("../../helper/CommonHelper/CommonHelper");


let coupenRelated = {

    addCoupenCode: (req, res) => {

        let name = req.body.name;
        let code = req.body.code;
        let description = req.body.description
        let offer = req.body.offer;
        let minimum_order = req.body.minimum_order
        let maximum_order = req.body.maximum_order;
        let valid_from = req.body.valid_from;
        let valid_to = req.body.valid_to;
        let status = req.body.status;
        let inserted_date = new Date(); 

        let newCoupen = {
            name: name,
            code: code,
            description: description,
            offer: offer,
            minimum_order: minimum_order,
            maximum_order: maximum_order,
            valid_from: new Date(valid_from),
            valid_to: new Date(valid_to),
            status: status,
            inserted_date: inserted_date,
            createdBy:"ADMIN",
            is_percentage: true 
        }


        adminHelper.addCoupenCode(newCoupen).then(() => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            if (err.code == 11000) { 
                res.send({ status: false, error: true, msg: "Coupen Code Already Exist" })
            }else{
                res.send({ status: false, error: true, msg: "Something went wrong" })
            }
             
            
        })
    },

    editCoupenCode: (req, res) => {

        let edit_id = req.body.edit_id;

        let editCoupen = {
            name: req.body.name,
            code: req.body.code,
            description: req.body.description,
            offer: req.body.offer,
            minimum_order: req.body.minimum_order,
            maximum_order: req.body.maximum_order,
            valid_from: req.body.valid_from,
            valid_to: req.body.valid_to,
            status: req.body.status,
        }

        adminHelper.editCoupenCode(edit_id, editCoupen).then(() => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },


    deleteCoupenCode: (req, res) => {

        let coupen_id = req.body.delete_id;

        adminHelper.deleteCoupenCode(coupen_id).then(() => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    getAllCoupenCode: (req, res) => {

        commonHelper.getAllCoupenCode().then((coupen) => {
            res.send({ status: true, error: false, coupens: coupen })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    getSingleCoupen: (req, res) => {

        let coupen_code = req.params.coupen_id

        commonHelper.getSingleCoupenCode(coupen_code).then((coupen) => {
            res.send({ status: true, error: false, coupen })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    }

}

module.exports = coupenRelated;