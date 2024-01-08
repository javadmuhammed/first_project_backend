
const commonHelper = require("../../helper/CommonHelper/CommonHelper"); 

let invoiceController = {
    downloadInvoice: (req, res) => {
        let invoice_id = req.body.invoice_id;

        console.log(invoice_id)

        commonHelper.downloadInvoice(invoice_id).then((docs) => {
            try {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
                res.send(docs);
            } catch (e) {
                res.send({ status: false, error: true, msg: "Invoice created failed" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Invoice created failed" })
        })
    },
}

module.exports = invoiceController;