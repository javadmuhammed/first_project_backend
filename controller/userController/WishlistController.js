const userHelperMethod = require("../../helper/UserHelper/userHelperMethod");


let wishlistController = {
    addToWishlist: (req, res) => {
        let userid = req.body.userid;
        let product_id = req.body.product_id;

        userHelperMethod.addToWishlist(userid, product_id).then((data) => {
            res.send({ status: true, error: false, product_id })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },


    getWishlistItems: function (req, res) {
        let user_id = req.body.userid;
        console.log("Reached here")
        userHelperMethod.getWishListItems(user_id).then((wishlistItem) => { 
            res.send({ status: true, error: false, wishlist: wishlistItem })
        }).catch((err) => { 
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    deleteWishlist: function (req, res) {
        let user_id = req.body.userid;
        let product_id = req.params.product_id;

        userHelperMethod.deleteWishlist(product_id, user_id).then(() => {
            console.log("Deleted " + user_id)
            res.send({ status: true, error: false, product_id })
        }).catch((err) => { 
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },
}

module.exports = wishlistController;