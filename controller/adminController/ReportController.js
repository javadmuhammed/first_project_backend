
const adminHelper = require("../../helper/AdminHelper/AdminHelper");


let reportController = {
    generateSalesReport: (req, res) => {

        let fromDate = req.body.from_date;
        let endDate = req.body.to_date;
        let category = req.body.category;
        let status = req.body.status;


        adminHelper.generateSalesReport(fromDate, endDate, category, status).then((generated) => {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Excel123.xlsx');
            generated.write('sales_report.xlsx', res);
            // res.end(generated.writeToBuffer('Excel.xlsx'), 'binary')
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Something went wrong, please try again" })
        })

    },


    generateSalesReportAsPdf: (req, res) => {
        let fromDate = req.body.from_date;
        let endDate = req.body.to_date;
        let category = req.body.category;
        let status = req.body.status;

        console.log("THIS REACHED PDF")

        adminHelper.generateSalesReportAsPdf(fromDate, endDate, category, status).then((generated) => {

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
            res.send(generated);
        }).catch((err) => {
            res.send({ status: true, error: false, msg: "Something went wrong, please try again" })
        });

    },


    generateProductSalesReport: (req, res) => {
        let product_id = req.body.product_id;

        adminHelper.generateProductSalesReport(product_id).then((generated) => {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
            res.send(generated);
        }).catch((err) => {
            res.send({ status: true, error: false, msg: "Something went wrong, please try again" })
        });

    }
}

module.exports = reportController;