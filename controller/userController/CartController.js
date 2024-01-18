
let userHelper = require("../../helper/UserHelper/userHelperMethod")

let cartController = {
    addToCart: (req, res) => {
        
        let product_id = req.body.product_id
        let userid = req.body.userid
        let variation = req.body.variation;


        console.log(req.body)


        userHelper.addToCart(product_id, userid, variation).then((quantity) => {
            res.send({ status: true, error: false, msg: "Cart update success", quantity })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: err })
        })
    },


    getCartItems: (req, res) => {
        let userid =  req.body.userid ;
        console.log("Cart USerid", userid)
        userHelper.getCartItems(userid).then((data) => { 
            res.send({ status: true, error: false, cart: data })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true })
        })
    },

    getCartPriceList: (req, res) => {
        let userid = req.body.userid;
        userHelper.getCartPriceList(userid).then((data) => {
            res.send({ status: true, error: false, cart: data })
        }).catch((err) => {
            res.send({ status: false, error: true })
        })
    },

    updateCartQuanity: (req, res) => {
        let cart_id = req.body.cart_id;
        let quantity = req.body.quantity;
        let userid = req.body.userid;
        let product_id = req.body.product_id;

        userHelper.updateCartQuanity(cart_id, quantity, userid, product_id).then((data) => {
            res.send({ status: true, error: false, newQuanity: quantity, msg: "Cart update success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Cart update failed " + err })
        })
    },


    updateCartVariation: (req, res) => {

        let cart_id = req.body.cart_id;
        let product_id = req.body.product_id;
        let variation = req.body.variation;
        let userid = req.body.userid;

        userHelper.updateVaritaionCart(cart_id, product_id, variation, userid).then((data) => {
            res.send({ status: true, error: false, msg: "Cart update success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Cart update failed " })
        })

    },


    deletCartItem: (req, res) => {

        let cart_id = req.params.cart_id;
        let product_id = req.params.product_id;
        let user_id = req.headers.reference;



        userHelper.deleteCartItem(cart_id, user_id, product_id).then((data) => {
            console.log(data)
            if (data?.deletedCount != 0) {
                res.send({ status: true, error: false, msg: "Cart item deleted" })
            } else {
                res.send({ status: false, error: true, msg: "Data couldn't found" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Cart delete failed " + err })
        })
    },


    clearCartItems: (req, res) => {
        let userid = req.body.userid

        userHelper.clearCartItems(userid).then((data) => {
            res.send({ status: true, error: false, msg: "Cart item cleared" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Cart clearing failed " })
        })
    },
}

module.exports = cartController;