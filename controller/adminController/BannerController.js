
const adminHelper = require("../../helper/AdminHelper/AdminHelper");
const commonHelper = require("../../helper/CommonHelper/CommonHelper");

let bannerController = {
    addBanner: (req, res) => {

        let bannerData = {
            name: req.body.name,
            url: req.body.url,
            images: req.body.image,
            status: req.body.status
        }

        adminHelper.addBanner(bannerData).then(() => {
            res.send({ status: true, error: false, msg: "Banner Created Success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Banner Created Failed" })
        })
    },

    editBanner: (req, res) => {

        let newData = {
            name: req.body.name,
            url: req.body.url,
            images: req.body.images,
            status: req.body.status
        }

        let editID = req.body.edit_id;


        console.log(req.body)

        adminHelper.editBanner(editID, newData).then(() => {
            res.send({ status: true, error: false, msg: "Banner Update Success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Banner Update Failed" })
        })

    },

    deleteBanner: (req, res) => {
        let dltId = req.body.delete_id;

        adminHelper.deleteBanner(dltId).then(() => {
            res.send({ status: true, error: false, msg: "Banner Delete Success" })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Banner Update Failed" })
        })
    },

    getBanner: (req, res) => {

        adminHelper.getAllBanner().then((banners) => {
            res.send({ status: true, error: false, banners })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Banner Fetching Failed" })
        })

    },

    getSingleBanner : (req,res) =>{
        let banner_id = req.params.banner_id;

        commonHelper.getSingleBanner(banner_id).then((banner)=>{
            res.send({ status: true, error: false, banner: banner})
        }).catch((err)=>{
            res.send({ status: false, error: true, msg: "Banner Fetching Failed" })
        })
    }
}

module.exports = bannerController;