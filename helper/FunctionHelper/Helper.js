const { default: ShortUniqueId } = require('short-unique-id');
const { v4: uuidv4 } = require('uuid');

let short_id = new ShortUniqueId({ length: 8 })

const HelperMethod = {

    createInvoiceID: () => {
        return "INV" + short_id.rnd().toUpperCase();
    },


    createOrderID: () => {
        return "ODR" + short_id.rnd().toUpperCase();
    },

    getValidDateFormat: (date) => {

        let valid_date;

        try {
            valid_date = new Date(date);
        } catch (err) {
            valid_date = new Date();
        }

        return (valid_date.getFullYear()) + "-" + (valid_date.getMonth() + 1) + "-" + valid_date.getDate()
    }

}


module.exports = HelperMethod;