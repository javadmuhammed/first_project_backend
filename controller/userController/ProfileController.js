const commonHelper = require("../../helper/CommonHelper/CommonHelper");
const userHelperMethod = require("../../helper/UserHelper/userHelperMethod");
const UserModalDb = require("../../modals/userModal");
const bcrypt = require("bcrypt");
 
let profileController = {

    
   


    


    
    profileRelated: function (req, res) {
        let user_id = req.body.userid;
        let user_data = req.body.userdata;

        userHelperMethod.updateUser(user_id, user_data).then(() => {
            res.send({ status: true, putData: user_data, error: false, msg: "Profile update success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },


    updatePhoneNumberRequest: (req, res) => {
        let user_id = req.body.userid;
        let phone_number = req.body.phone_number;


        userHelperMethod.updatePhoneNumberRequest(phone_number, user_id).then(() => {
            res.send({ status: true, error: false, msg: "OTP successfully sended" })
        }).catch((err) => {
            console.log("ERROR IS " + err)
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })

    },


    phonNumberUpdateOtpConfirmation: (req, res) => {
        let otp_number = req.body.otp_number;
        let userid = req.body.userid;

        userHelperMethod.phoneNumberUpdateConfimation(otp_number, userid).then(() => {
            res.send({ status: true, error: false, msg: "Phone number update success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err })
        })
    },


    profileImageUpdate: function (req, res) {
        let user_id = req.body.userid;

        let profileImage = req.files.profile;
        console.log(req.files, req.body)

        userHelperMethod.profilePicUpdate(profileImage, user_id).then((data) => {
            res.send({ status: true, error: false, profileImage: data, msg: "Profile Pic update success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" + err })
        })

    },


    updateUserPassword: async function (req, res) {
        let user_id = req.body.userid;
        let password = req.body.password;
        let current_password = req.body.current_password;



        try {
            let user_docs = await UserModalDb.findById(user_id);
            let isPasswordMatch = await bcrypt.compare(current_password.trim(), user_docs.password);
            console.log(isPasswordMatch)

            if (isPasswordMatch) {
                if (password == current_password) {
                    res.send({ status: false, error: true, msg: "The current password must differ from the previous password" });
                    return;
                }
                bcrypt.hash(password, 10).then((data) => {
                    if (!data) {
                        res.send({ status: false, error: true, msg: "Something went wrong" })
                    } else {
                        userHelperMethod.updateUser(user_id, { password: data }).then((data) => {
                            res.send({ status: true, error: false, msg: "Password update success" })
                        }).catch((err) => {
                            res.send({ status: false, error: true, msg: "Something went wrong" })
                        })
                    }
                }).catch((err) => {
                    res.send({ status: false, error: true, msg: "Something went wrong" })
                })
            } else {
                res.send({ status: false, error: true, msg: "Old password do not match" })
            }
        } catch (e) { 
            res.send({ status: false, error: true, msg: "Something went wrong" })
        }

    },


    updateEmailAddress: (req, res) => {
        let email_address = req.body.email_address;
        let userid = req.body.userid;

        userHelperMethod.updateEmailAddress(email_address, userid).then(() => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    },

    updateEmailAddressToken: (req, res) => {
        let token = req.params.token;

        userHelperMethod.updateEmailAddressToken(token).then(() => {
            res.send({ status: true, error: false })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err })
        })
    },
}

module.exports = profileController;