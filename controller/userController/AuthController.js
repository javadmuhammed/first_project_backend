const { jwt } = require("twilio");
const tokenHelper = require("../../helper/Token/TokenHelper");
const userHelperMethod = require("../../helper/UserHelper/userHelperMethod");
const UserModalDb = require("../../modals/userModal");
let bcrypt = require("bcrypt");
const commonHelper = require("../../helper/CommonHelper/CommonHelper");
const { default: ShortUniqueId } = require("short-unique-id");
const { default: mongoose } = require("mongoose");
const crypto = require("crypto")


let authController = {
    userLoginPost: (req, res) => {
        console.log("This is working")
        let { username, password } = req.body;
        password = password.trim()

        UserModalDb.findOne({
            $or: [
                { email: username },
                { username: username },
            ]
        }).then(async (user) => {
            console.log(user)
            if (user) {

                if (user?.is_delete) {
                    return res.send({ status: false, error: true, msg: "Username/email address couldn't find" })
                }

                if (user.isOtpValidated) {
                    let userPassword = user.password


                    try {
                        const comparePassword = await bcrypt.compare(password, userPassword);

                        if (comparePassword) {
                            console.log("Compared Password", comparePassword);
                            const token = await tokenHelper.TokenGenerator({ name: user.name, _id: user._id });

                            if (token) {
                                const data = await userHelperMethod.updateUser(user._id, { access_token: token });
                                data.access_token = token;

                                if (data) {
                                    user.access_token = token; 
                                    return res.send({ status: true, error: false, user, msg: "Logging success" });
                                } else {
                                    throw new Error("Something Went Wrong");
                                }
                            } else {
                                throw new Error("Token Generation Failed");
                            }
                        } else {
                            throw new Error("Incorrect Password");
                        }
                    } catch (err) {
                        return res.send({ status: false, error: true, msg: err.message });
                    }

                } else {
                    res.send({ status: false, error: true, msg: "OTP Is not validated" })
                }
            } else {
                res.send({ status: false, error: true, msg: "Username/email address couldn't find" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something Went Wrong" })
        })
    },


    userSignUpPost: async (req, res) => {

        let { firstName, lastName, phoneNumber, email, invited_code } = req.body
        let userName = "SAMPLE_ONE";


        let otp = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000
        let referal_code = new ShortUniqueId({ length: 10 }).rnd().toUpperCase();


        let userData = {
            username: userName,
            email: email,
            mobile: phoneNumber,
            first_name: firstName,
            last_name: lastName,
            otp: otp,
            referal_code,
            invited_code
        }

        UserModalDb.findOne({
            $or: [
                { email },
                { mobile: phoneNumber },
            ]
        }).then(async (findUser) => {
            console.log("User", findUser)

            try {

                if (findUser != null) {
                    if (findUser.isOtpValidated) {
                        res.render("/dashboard")
                        return res.send({ status: false, error: true, msg: "User Already Exits" });
                    } else {
                        res.render("/login")
                        userData._id = findUser._id;
                    }
                }

                userData.username = userName
                let userSignUp = await userHelperMethod.userSignUp(userData);
                let inviter_id = userData?._id ? userData?._id : userSignUp?._id;

                if (userSignUp) {
                    try {
                        await userHelperMethod.sendOTPSignup(otp, email)
                        let setReferalAmount = await userHelperMethod.insertReferalWalletAmount(invited_code, inviter_id);
                        console.log(setReferalAmount)
                        res.send({ status: true, user: userSignUp })
                    } catch (e) {
                        res.send({ status: false, error: true, msg: "OTP Sending Failed" })
                    }
                } else {
                    res.send({ status: false, error: true, msg: "User Insertion Failed" })
                }
            } catch (e) {
                res.send({ status: false, error: e.message })
            }
        })

    },



    forgetPassword: function (req, res) {

        let email = req.body.email;
        let domain = req.body.domain;

        UserModalDb.findOne({ email }).then(async (user) => {
            if (user) {

                let token = crypto.randomBytes(64).toString("hex");
                UserModalDb.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(user._id)
                    },
                    {
                        $set: {
                            token: token,
                            tokenExpire: Date.now() + 300000
                        }
                    }
                ).then((updated) => {
                    console.log(updated)
                    userHelperMethod.sendForgetPasswordEmail(email, domain + "/reset_password/" + token, user.username).then(() => {
                        res.send({ status: true, error: false, msg: "Email successfuly sended" })
                    }).catch(() => {
                        res.send({ status: false, error: true, msg: "Email sending failed" })
                    })
                }).catch((err) => {
                    res.send({ status: false, error: true, msg: "Something Went Wrong 1" })
                })

            } else {
                res.send({ status: false, error: true, msg: "Email address couldn't found" })
            }
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Something Went Wrong 2" })
        })
    },

    resetPassword: async function (req, res) {
        let tokenID = req.body.token;
        let password = req.body.password;

        let isTokenValid = await userHelperMethod.tokenValidation(tokenID)

        if (isTokenValid) {
            bcrypt.hash(password, 10, (err, newPassword) => {

                if (!err) {
                    UserModalDb.findOneAndUpdate(
                        {
                            token: tokenID
                        },
                        {
                            password: newPassword,
                            token: "",
                            tokenExpire: 0
                        }
                    ).then((data) => {
                        res.send({ status: true, error: false, msg: "Password successfully updated" })
                    }).catch((err) => {
                        res.send({ status: false, error: true, msg: "Password failed to update" })
                    })
                } else {
                    res.send({ status: false, error: true, msg: "Password failed to update" })
                }
            })
        } else {
            res.send({ status: false, error: true, msg: "Token is not valid" })
        }
    },

    tokenValidation: async function (req, res) {
        let token = req.params.token;
        let isTokenValid = await userHelperMethod.tokenValidation(token);
        if (isTokenValid) {
            res.send({ status: true, error: false, msg: "Token is Valid" })
        } else {
            res.send({ status: false, error: true, msg: "Token is not valid anymore" })
        }
    },

    validateJWT: function (req, res) {

        if ((req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') && (req.headers.refresh_reference)) {
            let access_token = req.headers.authorization.split(' ')[1];
            let refresh_reference = req.headers.refresh_reference;



            try {
                jwt.verify(access_token, process.env.JWT_SECRET, (err, data) => {
                    if (err) {
                        res.status(403).send({ status: false, error: true, msg: "Token is not valid" })
                    } else {
                        commonHelper.findSingleUser(refresh_reference).then((user) => {
                            if (user) {
                                res.status(200).send({ status: true, user, error: false, msg: "Token is   valid" })
                            } else {
                                res.status(403).send({ status: false, error: true, msg: "User may not exist" })
                            }
                        }).catch((err) => {
                            console.log(err)
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


    reGenerateJWT: function (req, res) {

        let referenceRefresh = req.body.refresh_token;
        UserModalDb.findById(referenceRefresh).then(async (user) => {
            if (user) {
                try {
                    let accessToken = await tokenHelper.TokenGenerator(user)
                    let responseData = { status: true, token: accessToken, error: false }
                    console.log(responseData)
                    res.send(responseData)
                } catch (e) {
                    res.send({ status: false, error: true })
                }
            } else {
                res.send({ status: false, error: true, msg: "Token is completly invalid" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something Went Wrong" })
        })
    },

    getUserByJwt: (req, res) => {
        let jwt_token = req.params.jwt_token;

        commonHelper.getUserByJwt(jwt_token).then((user) => {
            res.send({ status: true, error: false, user })
        }).catch((err)=>{
            res.send({ status: false, error: true,})
        })
    },

    otpValidation: function (req, res) {
        let otp = req.body.otp;
        let userid = req.body.userid;
        let password = req.body.password


        UserModalDb.findOne({ otp, _id: new mongoose.Types.ObjectId(userid) }).then((user) => {
            if (user) {
                let otp_validity = user.otp_validity;
                console.log(req.body)
                if (otp_validity > Date.now()) {
                    bcrypt.hash(password, 10, function (err, hash) {
                        if (err) {
                            res.send({ status: false, error: true, msg: "Something Went Wrong 1" + err })
                        } else {

                            UserModalDb.updateOne({ _id: new mongoose.Types.ObjectId(userid) }, { $set: { isOtpValidated: true, password: hash } }).then((userUpdated) => {
                                if (userUpdated && userUpdated.modifiedCount > 0) {
                                    res.send({ status: true, user, error: false, msg: "OTP validated success" })
                                } else {
                                    res.send({ status: false, error: true, msg: "Something went wrong 2 3" })
                                }
                            }).catch((err) => {
                                res.send({ status: false, error: true, msg: "Something went wrong 4" })
                            })
                        }
                    })
                } else {
                    res.send({ status: false, error: true, msg: "OTP Expired" })
                }
            } else {
                res.send({ status: false, error: true, msg: "Incorrect OTP" })
            }
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something Went Wrong 5" + err })
        })
    },
}

module.exports = authController;