const { default: mongoose } = require("mongoose");
const adminHelper = require("../../helper/AdminHelper/AdminHelper");
const { TokenGenerator } = require("../../helper/Token/TokenHelper");
const crypto = require("crypto");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const tokenHelper = require("../../helper/Token/TokenHelper");
const bcrypt = require("bcrypt")

let authController = {
    adminLoginPost: (req, res) => {
        let username = req.body.username;
        let password = req.body.password;




        adminHelper.vendorFind({ username, status: true }).then((vendor) => {
            console.log(vendor)
            if (vendor) {
                bcrypt.compare(password, vendor.password, (err, data) => {
                    console.log(err, data)
                    if (!data) {
                        res.send({ status: false, error: true, msg: "Incorrect Password" })
                    } else {

                        TokenGenerator({ username: vendor.username, first_name: vendor.first_name, last_name: vendor.last_name }).then((jwtToken) => {
                            adminHelper.updateVendor(vendor._id, { access_token: jwtToken }).then((updated) => {
                                res.send({ status: true, vendor, error: false, msg: "Loggin Success" })
                            }).catch((err) => {
                                res.send({ status: false, error: false, msg: "Something Went Wrong 1" })
                            })
                        }).catch((err) => {
                            res.send({ status: false, error: true, msg: err })
                        })


                    }
                })
            } else {
                res.send({ status: false, error: true, msg: "Username couldn't found" })
            }
        }).catch((err) => { 
            res.send({ status: false, error: true, msg: "Something went wrong 1" })
        })
    },


    forgetPassword: (req, res) => {
        let emailAddress = req.body.email;
        let token = crypto.randomBytes(64).toString("hex");
        let domain = req.body.domain;


        console.log(emailAddress)


        adminHelper.vendorFind({ email: emailAddress }).then((vendor) => {
            if (vendor) {

                let dataUpdate = {
                    token: token,
                    tokenExpire: Date.now() + 300000
                }

                adminHelper.updateVendor(vendor._id, dataUpdate).then((data) => {
                    let urlReset = domain + "/reset_password/" + token
                    adminHelper.adminResetPasswordLinkGenerator(vendor.email, urlReset, vendor.name ?? "Admin", domain).then((resetd) => {
                        res.send({ status: true, error: false, msg: "Password reset link has been sent to email" })
                    }).catch((err) => {
                        res.send({ status: false, error: true, msg: "Something Went Wrong 1" + err })
                    })
                }).catch((err) => {
                    res.send({ status: false, error: true, msg: "Something Went Wrong" })
                })
            } else {
                res.send({ status: false, error: true, msg: "Email address couln't found" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something Went Wrong" })
        })

    },


    resetPassword: function (req, res) {
        let token = req.body.token;
        let password = req.body.password;
        console.log(req.body)

        adminHelper.vendorFind({ token }).then((vendor) => {
            if (token) {
                let expireTime = vendor.tokenExpire;
                let currentTime = Date.now();

                if (currentTime < expireTime) {
                    bcrypt.hash(password, saltRounds, (err, data) => {
                        if (!data) {
                            res.send({ status: false, error: true, msg: "Something Went Wrong" })
                        } else {
                            let dataUpdate = {
                                token: "",
                                tokenExpire: 0,
                                password: data
                            }
                            adminHelper.updateVendor(vendor._id, dataUpdate).then((updated) => {

                                res.send({ status: true, error: false, msg: "Password update success" })
                            }).catch((err) => {
                                res.send({ status: false, error: true, msg: "Something went wrong" })
                            })
                        }
                    })

                } else {
                    res.send({ status: false, error: true, msg: "Token Time Expire" })
                }
            } else {
                res.send({ status: false, error: true, msg: "Token is not valid one" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Token is not valid one" })
        })
    },


    validateJwt: function (req, res) {
        if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') && (req.headers.reference)) {
            let access_token = req.headers.authorization.split(' ')[1];
            let reference = req.headers.reference;



            try {
                jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
                    if (err) {
                        res.status(403).send({ status: false, error: true, msg: "Token is not valid" })
                    } else {
                        adminHelper.vendorFind({ _id: new mongoose.Types.ObjectId(reference) }).then((vendor) => {
                            if (vendor) {
                                res.status(200).send({ status: true, vendor, error: false, msg: "Token is   valid" })
                            } else {
                                res.status(403).send({ status: false, error: true, msg: "User may not exist" })
                            }
                        }).catch((err) => {
                            res.status(403).send({ status: false, error: true, msg: "Something Went Wrong" })
                        })
                    }
                })
            } catch (err) {
                res.status(403).send({ status: false, error: true, msg: "Token is not valid" })
            }
        } else {
            res.status(404).send({ status: false, error: true, msg: "Header couldn't found" })
        }
    },


    regerarate_jwt: (req, res) => {
        let referenceRefresh = req.body.refresh_token;
        console.log(req.body)

        adminHelper.vendorFind({ _id: new mongoose.Types.ObjectId(referenceRefresh) }).then(async (vendor) => {
            if (vendor) {
                try {
                    let accessToken = await tokenHelper.TokenGenerator({ username: vendor.username, first_name: vendor.first_name, last_name: vendor.last_name })
                    let responseData = { status: true, token: accessToken, error: false }
                    res.send(responseData)
                } catch (e) {
                    res.send({ status: false, error: true })
                }
            } else {
                res.send({ status: false, error: true, msg: "Token is completly invalid" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something Went Wrong" + err })
        })
    },
}

module.exports = authController;