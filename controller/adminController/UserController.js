
const { default: ShortUniqueId } = require("short-unique-id");
const adminHelper = require("../../helper/AdminHelper/AdminHelper");
const bcrypt = require("bcrypt");
const UserModalDb = require("../../modals/userModal");
const { default: mongoose } = require("mongoose");


let userController = {
    addUser: (req, res) => {
        let userBody = req.body;

        let referal_code = new ShortUniqueId({ length: 10 }).rnd().toUpperCase();

        bcrypt.hash(userBody.password, 10, (err, newPassword) => {

            if (err) {
                res.send({ status: true, error: false, msg: "Something went wrong" })
                return;
            }

            let userData = {
                email: userBody.email,
                mobile: userBody.mobile,
                first_name: userBody.first_name,
                last_name: userBody.last_name,
                profile_pic: userBody.profile_pic,
                referal_code: referal_code,
                password: newPassword,
                status: userBody.status,
                isOtpValidated: true,
            }


            adminHelper.addUser(userData).then((data) => {
                res.send({ status: true, error: false, msg: "user created success" })
            }).catch((err) => {
                res.send({ status: false, error: true, msg: err })
            })
        })



    },

    getAllUsers: (req, res) => {


        adminHelper.getAllUsers().then((users) => {
            res.send({ status: true, error: false, users: users })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })

    },

    updateUser: async (req, res) => {
        let userBody = req.body.edit_data;
        let user_id = req.body.edit_id;

        let password = userBody.password;
        if (password) {
            try {
                let newPassword = await bcrypt.hash(userBody.password, 10);
                password = newPassword;
            } catch (e) {
                password = "";
            }
        }


        let findUser = await UserModalDb.findOne({
            $and: [
                {
                    $or: [
                        {
                            mobile: userBody?.mobile
                        },
                        {
                            email: userBody?.email
                        }
                    ],
                },
                {
                    _id: {
                        $nin:  user_id
                    }
                }
            ]
        });

        if (findUser) {
            return res.send({ status: false, error: true, msg: "This email/phone already exist for anthor user" })
        }

        adminHelper.updateUser(user_id, { $set: userBody }).then(() => {
            res.send({ status: true, error: false, msg: "user update success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err })
        })

    },

    deleteUser: (req, res) => {

        let user_id = req.body.delete_ids;

        let updateData = {
            is_delete: true
        }

        adminHelper.updateUser(user_id, updateData).then(() => {
            res.send({ status: true, error: false, msg: "user delete success" })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: err })
        })

    },

    getSingleUser: (req, res) => {
        let user_id = req.params.user_id;
 

        adminHelper.getSingleUser(user_id).then((user) => {
            res.send({ status: true, error: false, user })
        }).catch((err) => {
            res.send({ status: false, error: true, msg: "Something went wrong" })
        })
    }
}

module.exports = userController;