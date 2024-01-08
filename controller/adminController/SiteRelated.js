
const adminHelper = require("../../helper/AdminHelper/AdminHelper");

let staticController = {
    siteStatic: (req, res) => {

        let start_date = req.query.start_date;
        let end_date = req.query.end_date;
        let chart_type = req.query.chart_type;

        adminHelper.getSiteStatics(start_date, end_date,chart_type).then((dt) => {
            res.send({ status: true, error: false, data: dt })
        }).catch((err) => {
            console.log(err)
            res.send({ status: true, error: false, msg: "Something went wrong, please try again" })
        })

    },

    updateBasicSiteSettings: (req, res) => {
        let site_data = req.body.site_data;

        adminHelper.updateSiteSettings(site_data).then(() => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },

    getSiteBasicSettings: async (req, res) => {

     

        try {
            let siteData = await adminHelper.getSiteBasicSettings();
            if (siteData) {
                res.send({ status: true, error: false, data: siteData })
            } else {
                res.send({ status: false, error: true })
            }
        } catch (e) {
            res.send({ status: false, error: true })
        }
    }
}

module.exports = staticController;