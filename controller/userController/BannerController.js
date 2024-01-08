let commonHelper = require("../../helper/CommonHelper/CommonHelper")


let bannerController = {

    getAllBanners: (req, res) => {

        commonHelper.getAllActiveBanner().then((banners) => {
            res.send({ status: true, error: false, banners })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    }
}

module.exports = bannerController;