let emailConfig = require("../../config/emailConfig")
let nodeMailer = require("nodemailer");
let const_data = require("../../config/const");
let UserModal = require("../../modals/userModal");
const { default: mongoose } = require("mongoose");
const OrdersModalDb = require("../../modals/OrderModal");
const { addressModelDB } = require("../../modals/AddressModel");
const CartModel = require("../../modals/CartModel");
const HelperMethod = require("../FunctionHelper/Helper");
const InvoiceModel = require("../../modals/InvoiceModel");
const WishlistModel = require("../../modals/WishListModel");
const UserModalDb = require("../../modals/userModal");
const twilioConfig = require('twilio')(const_data.TWILIO_CONFIG.accountSid, const_data.TWILIO_CONFIG.authToken);
const Razorpay = require("razorpay");
let crypto = require("crypto");
const ProductModel = require("../../modals/ProductModel");
const smsAPI = require("../../API/sms_api");
const siteSettings = require("../../modals/SiteSettings");
const commonHelper = require("../CommonHelper/CommonHelper");
const coupenModel = require("../../modals/CoupenModel");
const WalletTopUpModel = require("../../modals/WalletTopUp");
const { default: ShortUniqueId } = require("short-unique-id");
const { generateIndividualCoupen } = require("../AdminHelper/AdminHelper");
const OrderProduct = require("../../modals/OrderProductModel")


let userHelperMethod = {



    sendForgetPasswordEmail: async (email, url, name) => {
        let mailerConfig = emailConfig.emailConfigObject;
        let mailTransport = nodeMailer.createTransport({
            service: mailerConfig.service,
            auth: mailerConfig.auth
        })



        let text = `Dear ${name} <br>,

        We received a request to reset your password for your ${const_data.WEBSITE_NAME} account. If you did not initiate this request, please ignore this email. Your account security is important to us <br>.
        
        If you did request a password reset, please follow the instructions below to reset your password:
        
        1. Click the following link to reset your password: <a href="${url}">Click here for reset password</a> <br>
         
        2. You will be directed to a page where you can create a new password for your account. <br>

        3. Password valid only for next 5 miniuts  <br>
        
        Please ensure that this request was initiated by you. If you have any concerns about the security of your account, please contact our support team immediately. <br>
        
        Thank you for using ${const_data.WEBSITE_NAME} <br>
        
        Best regards, <br>
        ${const_data.WEBSITE_NAME}
        `;



        let mailOption = {
            from: mailerConfig.auth.user,
            to: email,
            subject: 'Password Reset',
            html: text
        };

        return new Promise((resolve, reject) => {
            mailTransport.sendMail(mailOption).then(() => {
                resolve()
            }).catch((err) => {
                reject()
            })
        })
    },

    tokenValidation: async function (token) {
        try {
            let findUserByToken = await UserModal.findOne({ token: token });

            if (findUserByToken) {
                let currentDate = Date.now();
                if (findUserByToken.tokenExpire > currentDate) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    },

    sendOTPSignup: async function (otp, email) {
        let mailerConfig = emailConfig.emailConfigObject;
        let mailTransport = nodeMailer.createTransport({
            service: mailerConfig.service,
            auth: mailerConfig.auth
        })



        let text = `Welcome ${const_data.WEBSITE_NAME} ! We're excited to have you as a new member of our community. To complete your registration, we just need to verify your email address.

        <br>Your One-Time Password (OTP) for email verification is: ${otp} <br>
        
        Please enter this OTP code on the verification page <br>
         
        (Note: The OTP code is valid for next 5 miniuts.) <br>
        
        If you didn't sign up for ${const_data.WEBSITE_NAME}, please ignore this email. Your account security is important to us.<br>
        
        Thank you for choosing ${const_data.WEBSITE_NAME}. If you have any questions or need assistance, feel free to reach out to our support team.
        `;



        let mailOption = {
            from: mailerConfig.auth.user,
            to: email,
            subject: 'OTP Verification',
            html: text
        };

        return new Promise((resolve, reject) => {
            mailTransport.sendMail(mailOption).then(() => {
                resolve()
            }).catch((err) => {
                reject()
            })
        })
    },


    userSignUp: async function (user) {
        user.otp_validity = Date.now() + 300000
        try {
            let newUser;
            if (user && user._id) {
                newUser = await UserModal.findByIdAndUpdate(
                    user._id,
                    { $set: user },
                    { new: true, upsert: true }
                );
            } else {
                user.isOtpValidated = false;
                newUser = await UserModal.create(user);
            }


            console.log(newUser)

            return newUser || false;
        } catch (e) {
            console.log(e)
        }
    },


    updateUser: function (userid, data) {
        return new Promise((resolve, reject) => {

            UserModal.updateOne(
                {
                    _id: new mongoose.Types.ObjectId(userid)
                },
                {
                    $set: data
                }
            ).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    updateEmailAddress: (email_address, userid) => {
        return new Promise(async (resolve, reject) => {

            let mailerConfig = emailConfig.emailConfigObject;


            let token = crypto.randomBytes(10).toString("hex")
            let expire_time = new Date().getTime() + 300000;

            let updateData = {
                token: token,
                expire_time: expire_time,
                is_done: false,
                new_email: email_address
            }

            try {
                let checkOthers = await UserModal.findOne({ email: email_address });
                if (checkOthers) {
                    return reject("This email address already registered")
                }


                UserModal.updateOne({
                    _id: new mongoose.Types.ObjectId(userid)
                }, {
                    email_token: updateData
                }).then(async (success) => {

                    let mailTransport = nodeMailer.createTransport({
                        service: mailerConfig.service,
                        auth: mailerConfig.auth
                    })

                    let resetTokenUrl = "https://localhost:3000/reset_email_address/" + token;


                    let text = `<!DOCTYPE html>
                <html>
                <head>
                    <title>Email Reset Request</title>
                    
                </head>
                <body>
                    <h2>Email Reset Request</h2>
                    <p>Dear User,</p>
                
                    <p>We hope this email finds you well. We have received a request to update the email address associated with your account.</p>
                
                    <p>To ensure the security of your account, we require a verification step to complete this process. Please click on the following verification link to proceed with updating your email address:</p>
                    
                    <p><a href="${resetTokenUrl}" target="_blank">Verify Email Address</a></p>
                
                    <p>If you did not initiate this request, please disregard this email. Your account security is our priority, and no changes will be made without your action.</p>
                
                    <p>Please note that after verifying your email address, your account will be updated accordingly. You'll use the new email address for future login and communication purposes.</p>
                
                    <p>If above link not working copy below url and browse on new tab</p>

                    ${resetTokenUrl}
                
                    <p>Thank you for your cooperation and understanding.</p>
                
                    <p>Best regards,<br> 
                </body>
                </html>
                
                `;



                    let mailOption = {
                        from: mailerConfig.auth.user,
                        to: email_address,
                        subject: 'Email address reset option',
                        html: text
                    };

                    try {
                        await mailTransport.sendMail(mailOption)
                        resolve()
                    } catch (e) {
                        reject("Something went wrong")
                    }

                })
            } catch (e) {
                reject("Something went wrong")
            }


        })
    },


    updateEmailAddressToken: (token) => {
        return new Promise((resolve, reject) => {

            UserModal.findOne({
                "email_token.token": token
            }).then((user) => {
                if (user) {
                    let expireTime = user?.email_token?.expire_time;
                    let currentTime = new Date().getTime()

                    if (currentTime < expireTime) {
                        //if time is not expired
                        let newEmailAddress = user?.email_token?.new_email;
                        user.email = newEmailAddress;
                        user.save().then(() => {
                            resolve("Email update success")
                        }).catch((err) => {
                            reject("Something went wrong")
                        })
                    } else {
                        reject("Token time is expired")
                    }
                } else {
                    reject("Invalid Token")
                }
            }).catch((err) => {
                reject("Something went wrong")
            })

        })
    },


    updatePhoneNumberRequest: (phone_number, user_id) => {
        return new Promise(async (resolve, reject) => {

            const randomNum = Math.random() * 9000
            const OtpNumber = Math.floor(1000 + randomNum)
            let expire_time = new Date().getTime() + 300000;

            try {
                let findAnthorUser = await UserModal.findOne({ mobile: phone_number })

                if (findAnthorUser) {
                    reject("This phone number is already in use")
                } else {
                    UserModal.updateOne({
                        _id: new mongoose.Types.ObjectId(user_id)
                    },
                        {
                            phone_number_update: {
                                otp_number: OtpNumber,
                                otp_expire: expire_time,
                                new_number: phone_number
                            }
                        }).then(async () => {
                            await smsAPI.sendOTPSMS("user", phone_number, OtpNumber)
                            resolve("success")
                        }).catch((err) => {
                            console.log(err)
                            reject("Something went wrong")
                        })
                }
            } catch (e) {
                console.log(e)
                reject("Something went wrong")
            }
        })
    },



    phoneNumberUpdateConfimation: (otp_number, userid) => {
        return new Promise((resolve, reject) => {
            UserModal.findOne({
                _id: new mongoose.Types.ObjectId(userid)
            }).then((user) => {
                if (user) {

                    if (user?.phone_number_update?.otp_number == otp_number) {
                        if (user.phone_number_update.is_done) {
                            reject("OTP already submitted")
                        } else {
                            let currentTime = new Date().getTime();
                            if (user?.phone_number_update?.otp_expire >= currentTime) {
                                user.mobile = user?.phone_number_update?.new_number;
                                user.phone_number_update.is_done = true;
                                user.save().then(() => {
                                    resolve("Phone number update success")
                                }).catch((err) => {
                                    reject("Something went wrong")
                                })
                            } else {
                                reject("OTP time expire")
                            }
                        }
                    } else {
                        reject("Incorrect OTP number")
                    }
                } else {
                    reject("Authentication failed")
                }
            }).catch((err) => {
                reject("Something went wrong")
            })
        })
    },



    orderCancelEmailAttachment: (email_address, product_details, order_details, username, reason) => {
        let mailerConfig = emailConfig.emailConfigObject;
        let mailTransport = nodeMailer.createTransport({
            service: mailerConfig.service,
            auth: mailerConfig.auth
        })



        let text = `<!DOCTYPE html>
        <html>
        <head>
            <title>Product Return Request Submitted</title>
        </head>
        <body>
            <h2>Product Return Request Submitted</h2>
            <p>Dear ${username}</p>
        
            <p>We hope this email finds you well. We wanted to confirm that we've received your request for a product return. We're sorry to hear that you're not completely satisfied with your purchase, and we're committed to making the return process as smooth as possible.</p>
        
            <h3>Order Information:</h3>
            <ul>
                <li><strong>Order Number:</strong> ${order_details.order_id}</li>
                <li><strong>Date of Purchase:</strong> ${order_details.order_date}</li>
                <li><strong>Product Name:</strong> ${product_details.name}</li>
                <li><strong>Reason for Return:</strong> ${reason}</li>
            </ul>
        
            <h3>Return Request Status:</h3>
            <p>Your return request is currently under review. We aim to process your request as quickly as possible. Please allow us up to 48-72 hours to evaluate your request and get back to you.</p>
        
            <h3>Next Steps:</h3>
            <ol>
                <li>You will receive a follow-up email from our team once your return request has been reviewed. This email will contain instructions on how to proceed, including return shipping details, if applicable.</li>
                <li>Please ensure that the product you wish to return is in its original condition with all packaging and tags intact. This will help expedite the return process.</li>
                <li>If your return request is approved, we will process your refund according to our refund policy.</li>
            </ol>
        
            <h3>Contact Us:</h3>
            <p>If you have any questions or need further assistance, please feel free to contact our customer support team at <a href="mailto:[Customer Support Email]">[Customer Support Email]</a> or call us at [Customer Support Phone Number]. Our dedicated team is here to help you with any concerns or inquiries you may have.</p>
        
            <p><strong>Thank You:</strong></p>
            <p>Thank you for choosing us for your purchase, and we appreciate your patience and understanding during the return process. We value your satisfaction and are committed to providing the best service possible.</p>
        
            <p>Best regards,</p>
            <p>[Your Name]<br>[Your Title]<br>[Your Company Name]<br>[Your Contact Information]</p>
        </body>
        </html>
        `;



        let mailOption = {
            from: mailerConfig.auth.user,
            to: email,
            subject: 'Product Return Request Submitted',
            html: text
        };

        return new Promise((resolve, reject) => {
            mailTransport.sendMail(mailOption).then(() => {
                resolve()
            }).catch((err) => {
                reject()
            })
        })
    },

    getUserOrdersPagination: (userid, page_number, limit) => {

        return new Promise((resolve, reject) => {
            OrdersModalDb.aggregate(
                [
                    {
                        $facet: {
                            "orders": [
                                {
                                    $match: {
                                        user_id: new mongoose.Types.ObjectId(userid)
                                    }
                                },

                                {
                                    $sort: { "_id": -1 }
                                },
                                {
                                    $skip: Number(limit) * (Number(page_number) - 1)
                                },
                                {
                                    $limit: Number(limit)
                                },
                                {
                                    $lookup: {
                                        from: "products",
                                        localField: "products.product",
                                        foreignField: "_id",
                                        as: "product"
                                    }
                                },
                                {
                                    $addFields: {
                                        product: { $arrayElemAt: ["$product", 0] }
                                    }
                                }
                            ],
                            "total_order": [
                                {
                                    $match: {
                                        user_id: new mongoose.Types.ObjectId(userid)
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        total: { $sum: 1 }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            "total_order": {
                                $arrayElemAt: ["$total_order.total", 0]
                            }
                        }
                    },
                    {
                        $project: {
                            "page_number": page_number,
                            total_order: 1,
                            orders: 1
                        }
                    }
                ]
            ).then((orders) => {
                console.log(orders)
                resolve(orders[0])
            }).catch((err) => {
                reject(err);
            })
        })
    },

    getUserOrders: (userid) => {
        return new Promise((resolve, reject) => {

            OrdersModalDb.aggregate(
                [
                    {
                        $match: {
                            user_id: new mongoose.Types.ObjectId(userid)
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "products.product",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    {
                        $addFields: {
                            product: { $arrayElemAt: ["$product", 0] }
                        }
                    }
                ]
            ).then((orders) => {
                resolve(orders)
            }).catch((err) => {
                reject(err)
            })


            // OrdersModalDb.find({ user_id: userid }).then((orders) => {
            //     console.log(orders)
            //     resolve(orders)
            // }).catch((err) => {
            //     reject(err)
            // })
        })
    },

    addToWishlist: (userid, product_id) => {
        console.log(userid, product_id)
        return new Promise((resolve, reject) => {
            WishlistModel.findOne({ user_id: userid, product_id }).then((existItem) => {
                if (existItem) {
                    reject("Item already exits");
                } else {
                    new WishlistModel({ user_id: userid, product_id }).save().then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
                }
            })
        })
    },


    getWishListItems: (userid) => {
        console.log("Wish" + userid)
        return new Promise((resolve, reject) => {
            WishlistModel.find({ user_id: userid }).populate("product_id").then((wishlistItems) => {
                console.log("wishlist item " + wishlistItems)
                resolve(wishlistItems)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    deleteWishlist: (product_id, user_id) => {
        return new Promise((resolve, reject) => {
            WishlistModel.deleteOne({ user_id: user_id, product_id: new mongoose.Types.ObjectId(product_id) }).then((dt) => {
                console.log(dt)
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getAddressList: (user_id) => {
        return new Promise((resolve, reject) => {
            addressModelDB.find({ user_id }).then((address) => {
                resolve(address)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    addAddress: function (address, userid) {
        return new Promise(async (resolve, reject) => {
            try {
                let findAddress = await addressModelDB.findOne({ user_id: userid });
                let addressType = await addressModelDB.findOne({ user_id: userid, type: address.type });

                if (!findAddress) address.is_primary = true;
                else address.is_primary = false;

                console.log(findAddress)



                if (addressType) {
                    console.log("Address type already exist ")
                    reject("Address type already exist")
                } else {
                    console.log("Address type not exist ")
                    new addressModelDB(address).save().then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
                }
            } catch (err) {
                reject("Something went wrong")
            }
        })
    },



    setAddressAsPrimary: (user_id, address_id) => {
        console.log(user_id, address_id)
        return new Promise(async (resolve, reject) => {
            try {
                let updateAll = await addressModelDB.updateMany({ user_id }, { is_primary: false });
                let updateOne = await addressModelDB.updateOne({ user_id, _id: new mongoose.Types.ObjectId(address_id) }, { is_primary: true });
                console.log(updateAll, updateOne)
                resolve("Addresses updated successful");
            } catch (err) {
                console.error(err);
                reject("Error updating addresses");
            }
        })
    },

    addNewAddressType: (type, userid) => {
        return new Promise((resolve, reject) => {
            UserModalDb.findById(userid).then((user) => {
                if (user) {
                    if (user.extra_address_type.includes(type)) {
                        reject("Type already exist")
                    } else {
                        user.extra_address_type.push(type);
                        user.save().then(() => {
                            resolve("Address type added success")
                        }).catch((err) => {
                            reject("Something went wrong")
                        })
                    }
                } else {
                    reject("UnAuthorization detected")
                }
            }).catch((err) => reject("Something went wrong"))
        })
    },

    updateAddress: function (address, user_id, address_id) {
        return new Promise((resolve, reject) => {
            addressModelDB.updateOne({ _id: new mongoose.Types.ObjectId(address_id), user_id: new mongoose.Types.ObjectId(user_id) }, { $set: { ...address } }).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    },

    deleteAddress: function (address_id, user_id) {
        console.log(address_id, user_id)
        return new Promise((resolve, reject) => {
            addressModelDB.findOneAndUpdate({
                user_id: new mongoose.Types.ObjectId(user_id), _id: {
                    $ne: new mongoose.Types.ObjectId(address_id)
                }
            },
                {
                    is_primary: true
                }).then(() => {
                    addressModelDB.deleteOne({ _id: new mongoose.Types.ObjectId(address_id), user_id: new mongoose.Types.ObjectId(user_id) }).then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
                }).catch((err) => {
                    reject(err)
                })

        })
    },


    profilePicUpdate: function (profileImage, user_id) {

        let profileName = "user_profile_" + profileImage?.name

        return new Promise((resolve, reject) => {
            try {
                profileImage.mv("./public/images/userProfile/" + profileName, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        this.updateUser(user_id, { profile: profileName }).then(() => {
                            resolve(profileName)
                        }).catch((err) => {
                            reject(err)
                        })
                    }
                })
            } catch (e) {
                reject(e)
            }
        })

    },




    getCartItems: (userid) => {

        return new Promise((resolve, reject) => {
            CartModel.aggregate([
                {
                    $match: {
                        user_id: new mongoose.Types.ObjectId(userid)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'products.product_id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: '$productDetails'
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'productDetails.category',
                        foreignField: '_id',
                        as: 'productDetails.category'
                    }
                },
                {
                    $unwind: '$productDetails.category' // If 'category' is an array of objects
                },
                {
                    $addFields: {
                        "productDetails.category_offer": {
                            $multiply: [
                                {
                                    $divide: [
                                        { $toInt: '$productDetails.category.offer' }, 100
                                    ],
                                },
                                '$productDetails.sale_price'
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        "productDetails.sale_price": {
                            $subtract: [
                                '$productDetails.sale_price',
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $toInt: '$productDetails.category.offer' }, 100
                                            ],
                                        },
                                        '$productDetails.sale_price'
                                    ]
                                }
                            ]
                        }
                    }
                },



                {
                    $group: {
                        _id: null,
                        totalOffer: { $sum: { $toInt: '$productDetails.category_offer' } },
                        cartData: {
                            $push: {
                                _id: '$_id',
                                product_id: '$productDetails._id',
                                quantity: '$products.quantity',
                                productDetails: '$productDetails',
                                variation: '$products.variation'
                            }
                        },

                        subTotal: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ['$products.variation', 0.50] },
                                    then: { $divide: [{ $multiply: ['$productDetails.sale_price', '$products.quantity'] }, 2] },
                                    else: {
                                        $cond: {
                                            if: { $eq: ['$products.variation', 1.0] },
                                            then: { $multiply: ['$productDetails.sale_price', '$products.quantity'] },
                                            else: {
                                                $cond: {
                                                    if: { $eq: ['$products.variation', 2.0] },
                                                    then: { $multiply: [{ $multiply: ['$productDetails.sale_price', '$products.quantity'] }, 2] },
                                                    else: {
                                                        $cond: {
                                                            if: { $eq: ['$products.variation', 0.25] },
                                                            then: { $divide: [{ $multiply: ['$productDetails.sale_price', '$products.quantity'] }, 4] },
                                                            else: 0,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            }
                        },
                        total: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ['$products.variation', 0.50] },
                                    then: { $divide: [{ $multiply: ['$productDetails.original_price', '$products.quantity'] }, 2] },
                                    else: {
                                        $cond: {
                                            if: { $eq: ['$products.variation', 1.0] },
                                            then: { $multiply: ['$productDetails.original_price', '$products.quantity'] },
                                            else: {
                                                $cond: {
                                                    if: { $eq: ['$products.variation', 2.0] },
                                                    then: { $multiply: [{ $multiply: ['$productDetails.original_price', '$products.quantity'] }, 2] },
                                                    else: {
                                                        $cond: {
                                                            if: { $eq: ['$products.variation', 0.25] },
                                                            then: { $divide: [{ $multiply: ['$productDetails.original_price', '$products.quantity'] }, 4] },
                                                            else: 0,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            }
                        },
                        discount: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ['$products.variation', 0.50] },
                                    then: {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    { $multiply: ['$productDetails.original_price', '$products.quantity'] },
                                                    { $multiply: ['$productDetails.sale_price', '$products.quantity'] },
                                                ],
                                            },
                                            2,
                                        ],
                                    },
                                    else: {
                                        $cond: {
                                            if: { $eq: ['$products.variation', 1.0] },
                                            then: {
                                                $subtract: [
                                                    { $multiply: ['$productDetails.original_price', '$products.quantity'] },
                                                    { $multiply: ['$productDetails.sale_price', '$products.quantity'] },
                                                ],
                                            },
                                            else: {
                                                $cond: {
                                                    if: { $eq: ['$products.variation', 2.0] },
                                                    then: {
                                                        $multiply: [
                                                            {
                                                                $subtract: [
                                                                    { $multiply: ['$productDetails.original_price', '$products.quantity'] },
                                                                    { $multiply: ['$productDetails.sale_price', '$products.quantity'] },
                                                                ],
                                                            },
                                                            2,
                                                        ],
                                                    },
                                                    else: {
                                                        $cond: {
                                                            if: { $eq: ['$products.variation', 0.25] },
                                                            then: {
                                                                $divide: [
                                                                    {
                                                                        $subtract: [
                                                                            { $multiply: ['$productDetails.original_price', '$products.quantity'] },
                                                                            { $multiply: ['$productDetails.sale_price', '$products.quantity'] },
                                                                        ],
                                                                    },
                                                                    4,
                                                                ],
                                                            },
                                                            else: 0,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    }
                                },
                            }
                        },
                    },
                },
                {
                    $sort: {
                        'cartData.productDetails.name': 1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        cartData: 1,
                        priceList: {
                            subTotal: '$subTotal',
                            total: '$total',
                            discount: '$discount',
                            category_offer: "$totalOffer",
                        },
                    }
                },

                // {
                //     $replaceRoot: { newRoot: { $mergeObjects: [{ cartData: '$cartData' }, { priceList: '$priceList' }] } }
                // }
            ]).then((data) => {
                // data is an array, but you can convert it to an object since we know it has a single result
                const cart = data[0];
                console.log("Cart data", cart)
                resolve(cart);
            }).catch((err) => {
                console.log("Error found", err)
                reject(err);
            });

        })
    },


    addToCart: (product_id, user_id, variation) => {
        return new Promise((resolve, reject) => {


            let cartItem = {
                product_id,
                quantity: 1,
                variation: variation ?? const_data.PRODUCT_VARIATION["1kg"]
            }

            CartModel.findOne({ user_id }).then((data) => {
                if (data) {

                    const productExists = data.products.find((item) => item.product_id.equals(cartItem.product_id));

                    if (productExists) {
                        productExists.quantity++
                        console.log(data)
                        data.save().then((pushed) => {
                            resolve(productExists.quantity)
                        }).catch((err) => {
                            console.log(err)
                            reject("Something went wrong");
                        })
                    } else {
                        data.products.push(cartItem)
                        data.save().then(() => {
                            resolve(cartItem.quantity)
                        }).catch((err) => {
                            reject("Something went wrong");
                        })
                    }
                } else {
                    new CartModel({ user_id, products: [cartItem] }).save().then((data) => {
                        resolve(cartItem.quantity)
                    }).catch((err) => {
                        reject("Something went wrong");
                    })
                }
            }).catch((err) => {
                reject("Something went wrong ");
            })
        })
    },

    updateCartQuanity: (cartid, quantity, user_id, product_id) => {
        return new Promise((resolve, reject) => {

            if (quantity <= 0) {
                return;
            } else {
                CartModel.findOne({ user_id: new mongoose.Types.ObjectId(user_id), _id: new mongoose.Types.ObjectId(cartid) }).then((cartData) => {
                    if (cartData) {
                        let findIndex = cartData?.products.findIndex((item) => item.product_id == product_id);
                        if (findIndex != -1) {
                            cartData.products[findIndex].quantity = quantity;
                            cartData.save().then((saved) => {
                                resolve(saved)
                            }).catch((err) => {
                                reject(err);
                            })
                        } else {
                            reject("Product  not found")
                        }
                    } else {
                        reject("Cart  not found")
                    }
                }).catch((err) => {
                    reject("Something went wrong")
                })
            }
        })
    },

    updateVaritaionCart: (cart_id, product_id, variation, userid) => {



        return new Promise((resolve, reject) => {
            variation = const_data.PRODUCT_VARIATION[variation];
            if (variation) {
                CartModel.findOne({
                    user_id: new mongoose.Types.ObjectId(userid),
                    _id: new mongoose.Types.ObjectId(cart_id),
                }).then((cartItem) => {
                    if (cartItem) {
                        let findProductIndex = cartItem?.products?.findIndex((each) => each.product_id == product_id);

                        if (findProductIndex != -1) {

                            if (cartItem && cartItem.products[findProductIndex]) {
                                cartItem.products[findProductIndex].variation = variation;
                                cartItem.save().then(() => {
                                    resolve("Cart update success")
                                }).catch((err) => {
                                    console.log(err)
                                    reject("Cart update failed");
                                })
                            } else {
                                reject("Cart update failed");
                            }
                        } else {
                            reject("Product do not found")
                        }
                    } else {
                        reject("Cart do not found")
                    }
                }).catch((err) => {
                    reject("Something went wrong")
                })
            } else {
                reject("Product variation do not found")
            }
        })
    },


    deleteCartItem: (cartid, userid, product_id) => {
        console.log(cartid, userid)
        return new Promise((resolve, reject) => {
            CartModel.updateOne({ _id: new mongoose.Types.ObjectId(cartid), user_id: new mongoose.Types.ObjectId(userid) }, {
                $pull: {
                    products: {
                        product_id: new mongoose.Types.ObjectId(product_id)
                    }
                }
            }).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err);
            })
        })
    },


    clearCartItems: (userid) => {
        return new Promise((resolve, reject) => {
            console.log("Cart dlt request")
            CartModel.deleteMany({ user_id: new mongoose.Types.ObjectId(userid) }).then((data) => {
                console.log(data)
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getSingleInvoice: async (invoice_number, userid) => {

        try {
            let getInvoiceSummery = await commonHelper.getInvoiceSummery(invoice_number, userid)
          
            let invoiceData = await InvoiceModel.aggregate([
                {
                    $match: { invoice_number: invoice_number, userid: new mongoose.Types.ObjectId(userid) }
                },
                {
                    $addFields: {
                        invoice_summary: getInvoiceSummery
                    }
                }
            ])

            console.log("Summary product is");
            console.log(invoiceData)

            return invoiceData[0];
        } catch (e) {
            return new Error("Something Went Wrong")
        } 
    },

    placeInvoice: (phone, userid, address_id) => {
        return new Promise(async (resolve, reject) => {


            try {
                // let userDetails = await UserModal.findOne({ _id: new mongoose.Types.ObjectId(userid) })
                let addressDetails = await addressModelDB.findOne({ _id: new mongoose.Types.ObjectId(address_id) })


                userHelperMethod.getCartItems(userid).then((response) => {
                    let data = response


                    let totalPrice = data?.priceList?.subTotal;
                    let invoice_number = HelperMethod.createInvoiceID();

                    let OTPNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                    let otp_expire = new Date().getTime() + 1800000

                    let dataInvoicePlace = {
                        userid: userid,
                        phone_number: phone,
                        otp_number: OTPNumber,
                        otp_expire,
                        invoice_number,
                        invoice_date: new Date(),
                        status: const_data.INVOICE_STATUS.PENDING,
                        total_amount: totalPrice,
                        original_amount: totalPrice,
                        order_placed: false,
                        products: [],
                        address: addressDetails
                    }

                    data?.cartData?.forEach((items) => {
                        dataInvoicePlace.products.push({
                            product: items.product_id,
                            quantity: items.quantity,
                            priceAtPurchase: ((items?.productDetails?.sale_price) * (items.quantity)),
                            variation: items.variation
                        })
                    })


                    new InvoiceModel(dataInvoicePlace).save().then((suc) => {
                        userExternalHelper.sendInvoiceOTP(phone, OTPNumber).then((dt) => {
                            resolve(invoice_number)
                        }).catch((err) => {
                            console.log(err)
                            reject("Something went wrong")
                        })
                    }).catch((err) => {
                        console.log(err)

                        reject("Invoice created failed")
                    })
                })
            } catch (e) {

            }


        })
    },

    buySingleProduct: async (userid, phone, address_id, product_id, variation, quantity) => {
        try {
            let addressDetails = await addressModelDB.findOne({ _id: new mongoose.Types.ObjectId(address_id) })
            let productDetails = await commonHelper.getExactProductPrice(product_id, variation)

            if (productDetails) {


                let totalPrice = productDetails.sale_price
                let invoice_number = HelperMethod.createInvoiceID();

                let OTPNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                let otp_expire = new Date().getTime() + 1800000

                let dataInvoicePlace = {
                    userid: userid,
                    phone_number: phone,
                    otp_number: OTPNumber,
                    otp_expire,
                    invoice_number,
                    invoice_date: new Date(),
                    status: const_data.INVOICE_STATUS.PENDING,
                    total_amount: totalPrice,
                    original_amount: totalPrice,
                    order_placed: false,
                    products: [{
                        product: product_id,
                        quantity: quantity,
                        priceAtPurchase: totalPrice,
                        variation: variation,
                        category: productDetails.category,
                        sub_total: productDetails.sale_price,
                        total: productDetails.original_price,
                        discount: productDetails.discount,
                    }],
                    address: addressDetails
                }

                await new InvoiceModel(dataInvoicePlace).save()
                await userExternalHelper.sendInvoiceOTP(phone, OTPNumber)
                return invoice_number;
            } else {
                return new Error("Product not found");
            }
        } catch (e) {
            return new Error(e);
        }
    },

    invoicePhoneVerification: (userid, otpField, phone, invoice_id) => {
        console.log(invoice_id, userid)
        return new Promise((resolve, reject) => {
            InvoiceModel.findOne({ userid: new mongoose.Types.ObjectId(userid), invoice_number: invoice_id }).then((thisinvoice) => {
                if (thisinvoice) {
                    if (thisinvoice.otp_number == otpField) {
                        let currentTime = new Date().getTime();
                        if (currentTime >= thisinvoice.otp_expire) {
                            reject("OTP time has expired")
                        } else {
                            thisinvoice.is_number_verified = true;
                            thisinvoice.save().then((saved) => {
                                resolve("OTP has verified")
                            }).catch((err) => {

                                console.log("The error is", err)
                                reject("OTP verification failed")
                            })
                        }
                    } else {
                        reject("Incorrect OTP")
                    }
                } else {
                    reject("invoice couldn't found")
                }
            }).catch((err) => {
                console.log(err)
                reject("Something went wrong")
            })
        })
    },

    updateOrderInvoice: async (order_id, invoice_id, user_id, invoice_data, order_data) => {


        try {
            let updateInvoice = await InvoiceModel.updateOne({ _id: new mongoose.Types.ObjectId(invoice_id) }, invoice_data);
            let orderUpdate = await OrdersModalDb.updateOne({ _id: new mongoose.Types.ObjectId(order_id), }, order_data);
            return true
        } catch (e) {
            return false;
        }
    },

    checkOrderUpdateNextStatus: (presentStatus) => {
        let orderStatusValues = Object.values(const_data.ORDER_STATUS);
        let orderStatusKeys = Object.keys(const_data.ORDER_STATUS);
        let currentStatus = orderStatusValues.indexOf(presentStatus)
        let keyOfCurrentStatus = const_data.ORDER_STATUS[orderStatusKeys[currentStatus]];


        let allowedNext = [const_data.ORDER_STATUS.ORDER_RECEIVED, const_data.ORDER_STATUS.PREPARING_ORDER, const_data.ORDER_STATUS.READY_FOR_PICKUP, const_data.ORDER_STATUS.PICKED]

        let nextStatus = [];

        if (keyOfCurrentStatus == const_data.ORDER_STATUS.DELIVERED) {
            nextStatus.push(orderStatusKeys[orderStatusValues.indexOf(const_data.ORDER_STATUS.RETURNED_REQUEST)])
        } else if (keyOfCurrentStatus == const_data.ORDER_STATUS.RETURNED) {
            nextStatus.push(orderStatusKeys[orderStatusValues.indexOf(const_data.ORDER_STATUS.REFUND)])
        } else if (keyOfCurrentStatus == const_data.ORDER_STATUS.RETURNED_REQUEST) {
            nextStatus.push(orderStatusKeys[orderStatusValues.indexOf(const_data.ORDER_STATUS.RETURNED)])
        } else if (orderStatusKeys[currentStatus + 1] && allowedNext.includes(keyOfCurrentStatus)) {
            nextStatus.push(orderStatusKeys[currentStatus + 1])
            nextStatus.push(orderStatusKeys[5])
        }

        return nextStatus;

    },

    updateInvoice: (userid, invoiceId, update_date) => {

        return new Promise((resolve, reject) => {
            InvoiceModel.findOne({ invoice_number: invoiceId }).then((invoiceData) => {
                if (invoiceData) {


                    InvoiceModel.updateOne({
                        invoice_number: invoiceId,
                        userid: userid
                    }, update_date).then(async (updated) => {

                        if ((!invoiceData.order_placed) && update_date.order_placed) {

                            let ordersData = [];
                            let productUpdate = [];
                            let orderProduct = []


                            const processProducts = async () => {
                                for (const products of invoiceData?.products) {
                                    try {
                                        let findProduct = await commonHelper.getExactOrderProductPrice(products.product, products.variation, products.quantity) // ProductModel.findById(products.product);

                                        if (findProduct && (findProduct.stock >= 1 && findProduct.stock >= products.quantity)) {


                                            let productPrice = findProduct.sale_price //commonHelper.getProductPriceByVariation(products.priceAtPurchase, products.variation)

                                            if (invoiceData?.coupen_applied !== null || invoiceData?.coupen_applied !== "" || invoiceData?.coupen_applied !== undefined) {
                                                let originalAmount = invoiceData?.original_amount
                                                let totalAmount = invoiceData?.total_amount

                                                let coupenDiscountPerItem = (originalAmount - totalAmount) / invoiceData?.products?.length;
                                                productPrice = (productPrice - coupenDiscountPerItem).toFixed(2);
                                            }

                                            const order_id = HelperMethod.createOrderID()
                                            console.log("Find product : " + findProduct)

                                            orderProduct.push({ ...findProduct._doc, order_id: order_id })

                                            ordersData.push({
                                                order_id: order_id,
                                                order_date: new Date(),
                                                shipper_name: invoiceData?.address?.name,
                                                total: findProduct.sale_price,
                                                status: const_data.ORDER_STATUS.ORDER_RECEIVED,
                                                address: invoiceData.address,
                                                user_id: userid,
                                                invoice_id: invoiceData._id,
                                                payment_type: update_date.payment_method,
                                                products: {
                                                    product: products.product,
                                                    quantity: products.quantity,
                                                    variation: products.variation,
                                                    category: findProduct.category,
                                                    sub_total: findProduct.sale_price,
                                                    total: findProduct.original_price,
                                                    discount: findProduct.discount,
                                                },
                                                delivery_time: update_date.delivery_time,
                                                invoice_number: invoiceId
                                            })

                                            productUpdate.push({
                                                updateOne: {
                                                    filter: { _id: products.product },
                                                    update: {
                                                        $inc: {
                                                            stock: -products.quantity,
                                                            number_of_orders: products?.quantity
                                                        }
                                                    }
                                                }
                                            })
                                        }

                                        console.log("Order Data ", ordersData)
                                    } catch (e) {
                                        console.log("Error found")
                                        console.log(e);
                                    }
                                }
                            };



                            await processProducts();

                            console.log("Orderd product");
                            console.log(orderProduct)

                            if (ordersData.length > 0) {
                                try {

                                    let findUser = await UserModalDb.findById(userid);

                                    if (findUser) {
                                        let number_of_user_order = findUser.number_orders_placed
                                        if (update_date.payment_method == const_data.PAYMENT_METHOD.WALLET) {
                                            await commonHelper.withdrawAmountFromWallet(userid, invoiceData?.total_amount, "WITHDRAW", "Purchase")
                                        }
                                        findUser.number_orders_placed += ordersData.length;
                                        await findUser.save()




                                        let coupenAmount = 0;
                                        OrdersModalDb.insertMany(ordersData).then(async (dt) => {

                                            try {
                                                await CartModel.deleteMany({ user_id: new mongoose.Types.ObjectId(userid) })
                                                await ProductModel.bulkWrite(productUpdate)
                                                await OrderProduct.insertMany(orderProduct)

                                                if (number_of_user_order == 0) {
                                                    await generateIndividualCoupen(userid, "First Order", "First Order Coupen Code", const_data.FIRST_ORDER_COUEPN_OFFER, false, 1000, 10000, new Date(), new Date().setDate(new Date().getDate() + 10))
                                                } else {
                                                    if (invoiceData?.total_amount >= 100) {
                                                        let suppose = (2 / 100) * invoiceData?.total_amount
                                                        if (suppose >= 10) {
                                                            coupenAmount = 10
                                                        } else {
                                                            coupenAmount = Math.floor(suppose)
                                                        }
                                                    }
                                                    if (coupenAmount != 0) await generateIndividualCoupen(userid, "Purchase Reward", "Product Purchase Reward", coupenAmount, false, 1000, 10000, new Date(), new Date().setDate(new Date().getDate() + 10))
                                                }

                                            } catch (e) {
                                                console.log(e)
                                                // resolve("Product orderd success");
                                            }
                                            finally {
                                                resolve({ coupen: coupenAmount != 0, msg: "Product orderd success" });
                                            }
                                        }).catch((err) => {
                                            reject("Product order failed")
                                        })
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            } else {
                                reject("No product available")
                            }

                        } else {
                            reject("Invoice updated")
                        }

                    }).catch((err) => {
                        reject("Invoice updation failed")
                    })
                }
            })

        })
    },


    updateOrderInvoice: async (order_id, invoice_id, user_id, invoice_update, order_update) => {
        try {
            let updateOrder = await OrdersModalDb.updateOne({ user_id: new mongoose.Types.ObjectId(user_id), _id: new mongoose.Types.ObjectId(order_id) }, { $set: order_update })
            let updateInvoice = await InvoiceModel.updateOne({ user_id: new mongoose.Types.ObjectId(user_id), _id: new mongoose.Types.ObjectId(invoice_id) }, { $set: invoice_update });
            return true;
        } catch (e) {
            return false
        }
    },

    updateInvoiceNumber: async (userid, invoiceId, phone_number) => {

        try {

            let OTPNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            let otp_expire = new Date().getTime() + 1800000

            let invoiceData = await InvoiceModel.findOneAndUpdate({ userid: new mongoose.Types.ObjectId(userid), invoice_number: invoiceId, order_placed: false, is_number_verified: false },
                {
                    phone_number,
                    otp_number: OTPNumber,
                    otp_expire
                },
                { new: true }
            );

            if (invoiceData) {
                await userExternalHelper.sendInvoiceOTP(phone_number, OTPNumber)
            }
            return true
        } catch (e) {
            return false;
        }

    },


    placeOrder: (invoice_id, paymentType) => {
        return new Promise((resolve, reject) => {

            if (Object.values(const_data.PAYMENT_METHOD).includes(paymentType)) {

                InvoiceModel.aggregate([
                    {
                        $match: {
                            invoice_number: invoice_id
                        }
                    },
                    {
                        $unwind: "$products"
                    },
                    {
                        $lookup: {
                            from: "addresses",
                            localField: 'address_id',
                            foreignField: "_id",
                            as: "address"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: 'userid',
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            order_id: HelperMethod.createOrderID(),
                            order_date: new Date(),
                            shipper_name: { $arrayElemAt: ["$address.name", 0] },
                            total: { $multiply: ["$products.quantity", "$products.priceAtPurchase"] },
                            status: const_data.ORDER_STATUS.PENDING,
                            address: { $arrayElemAt: ["$address", 0] },
                            user_id: { $arrayElemAt: ["$user._id", 0] },
                            invoice_id: invoice_id,
                            payment_type: paymentType,
                            products: {
                                product: "$products._id",
                                quantity: "$products.quantity"
                            }
                        }
                    },
                ]).then((insertedData) => {
                    console.log(insertedData)
                    InvoiceModel.findOne({ invoice_number: invoice_id }).then((invoiceData) => {
                        console.log("Invoice Data", invoiceData)
                        if (invoiceData?.order_placed) {
                            reject("Invoice already paid")
                        } else {
                            InvoiceModel.updateOne({ invoice_number: invoice_id }, { $set: { order_placed: true } }).then((data) => {

                                userHelperMethod.clearCartItems(insertedData.user_id).then((data) => {
                                    OrdersModalDb.insertMany(insertedData).then((inserted) => {
                                        resolve("order successfuly completed")
                                    }).catch((err) => {
                                        reject("order placing failed")
                                    })
                                }).catch((err) => {
                                    reject("Cart clearing failed")
                                })

                            }).catch((err) => {
                                reject("order placing failed")
                            })
                        }
                    }).catch((err) => {
                        reject("Invoice not found")
                    })
                }).catch((err) => {
                    reject("Something went wrong")
                })
            } else {
                reject("Payment method couldn't found")
            }

        })
    },

    resendCheckoutVerificationOtp: (userid, phoneNumber, invoice_id) => {
        return new Promise((resolve, reject) => {
            InvoiceModel.findOne({ invoice_number: invoice_id, userid: new mongoose.Types.ObjectId(userid), phone_number: phoneNumber, order_placed: false, is_number_verified: false }).then((reSendUser) => {
                if (reSendUser) {

                    let OTPNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                    let otp_expire = new Date().getTime() + 1800000


                    InvoiceModel.updateOne({
                        invoice_number: invoice_id
                    }, {
                        $set: {
                            otp_number: OTPNumber,
                            otp_expire: otp_expire
                        }
                    }).then(() => {
                        userExternalHelper.sendInvoiceOTP(phoneNumber, OTPNumber).then(() => {
                            resolve("OTP resend success");
                        }).catch((err) => {
                            reject("Something went wrong")
                        })
                    }).catch((err) => {
                        reject("Something went wrong")
                    })

                } else {
                    reject("No data found")
                }
            }).catch((err) => {
                reject("Something went wrong")
            })
        })
    },

    createRazorOrder: (invoice_id) => {
        return new Promise(async (resolve, reject) => {

            try {
                let invoiceData = await InvoiceModel.findOne({ invoice_number: invoice_id });

                if (invoiceData) {
                    let RazorpayInstance = new Razorpay({ key_id: const_data.RAZORPAY_CRED.KEY, key_secret: const_data.RAZORPAY_CRED.SECRET });

                    RazorpayInstance.orders.create({

                        amount: invoiceData.total_amount * 100,
                        currency: "INR",
                        receipt: crypto.randomBytes(10).toString("hex"),
                    }).then((response) => {
                        resolve(response)
                    }).catch((err) => {
                        console.log(err)
                        reject(err)
                    })
                } else {
                    reject("No invoice found")
                }
            } catch (e) {
                reject("Something went wrong")
            }
        })
    },

    verifyRazorpayPayment: (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
        console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        return new Promise((resolve, reject) => {
            try {
                const sign = razorpay_order_id + "|" + razorpay_payment_id;
                const expectedSign = crypto.createHmac("sha256", const_data.RAZORPAY_CRED.SECRET).update(sign.toString()).digest("hex");
                console.log("Expected is", expectedSign)
                if (razorpay_signature === expectedSign) {
                    resolve("payment success")
                } else {
                    reject("invalid payment sign")
                }
            } catch (error) {
                console.log(error)
                reject("Something went wrong")
            }
        })
    },


    insertReferalWalletAmount: async (referal_id, inviter_id) => {
        console.log(referal_id, inviter_id)
        try {
            let referalUser = await UserModalDb.findOne({ referal_code: referal_id })
            let inviteUser = await UserModalDb.findById(inviter_id);
            let webSettings = await siteSettings.findOne({});

            if (referalUser && inviteUser) {
                await commonHelper.addAmountToWallet(referalUser._id, webSettings?.referred_bonus, "NA", const_data.WALLET_CREDIT_FROM.REFER);
                await commonHelper.addAmountToWallet(inviteUser._id, webSettings?.referrer_bonus, "NA", const_data.WALLET_CREDIT_FROM.SIGN_UP);
                return true;
            } else {
                console.log(referalUser, inviteUser)
                return false;
            }
        } catch (e) {
            console.log(e)
            return false;
        }
    },

    createWalletOrder: (userid, amount, name, phone) => {

        return new Promise((resolve, reject) => {



            let razorpayInstance = new Razorpay({ key_id: const_data.RAZORPAY_CRED.KEY, key_secret: const_data.RAZORPAY_CRED.SECRET });
            razorpayInstance.orders.create({
                amount: amount * 100,
                currency: "INR",
                receipt: new ShortUniqueId({ length: 20 }).rnd()
            }).then((order) => {
                new WalletTopUpModel({ amount, full_name: name, phone_number: phone, user_id: userid, order_id: order.id }).save().then(() => {
                    resolve(order);
                }).catch((err) => {
                    reject(err)
                })
            }).catch((err) => {
                reject(err)
            })

        })
    },

    verifyWalletOrder: (userid, razorpay_payment_id, razorpay_order_id, razorpay_signature) => {
        return new Promise((resolve, reject) => {

            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto.createHmac("sha256", const_data.RAZORPAY_CRED.SECRET).update(sign.toString()).digest("hex");

            if (razorpay_signature === expectedSign) {
                WalletTopUpModel.findOne({ user_id: userid, order_id: razorpay_order_id }).then((wallet_topup) => {
                    if (wallet_topup) {
                        let amount = wallet_topup.amount;
                        commonHelper.addAmountToWallet(userid, amount, razorpay_payment_id, "Reacharge").then(() => {
                            resolve("Payment success")
                        }).catch((err) => {
                            reject("Something went wrong")
                        })
                    } else {
                        reject("Data not matching")
                    }
                }).catch((err) => {
                    reject("Something went wrong")
                })
                resolve("Payment success")
            } else {
                reject("Payment failed")
            }
        })
    },

    applyCoupenCode: async (coupen_code, invoice_id, user_id) => {

        try {
            let findCoupenCode = await coupenModel.findOne({ code: coupen_code })
            let findUser = await UserModal.findById(user_id)
            let findInvoice = await InvoiceModel.findOne({ invoice_number: invoice_id })



            if (findCoupenCode && findUser && findInvoice) {
                let validFrom = new Date(findCoupenCode.valid_from).getTime();
                let validTo = new Date(findCoupenCode.valid_to).getTime();
                let currentTime = new Date().getTime();

                if (findInvoice.order_placed) {
                    return { status: false, msg: "The order already placed" }
                }
                if (currentTime < validFrom) {
                    //Not started yet
                    return { status: false, msg: "The coupon offer hasn't started yet." }
                } else if (currentTime > validTo) {
                    //Expired
                    return { status: false, msg: "The coupon offer has expired" }
                } else {
                    //Valid
                    if (findUser.applied_coupen.includes(coupen_code)) {
                        //Already used
                        return { status: false, msg: "You've already utilized this offer." }
                    } else {
                        let minimum_require = findCoupenCode.minimum_order;
                        let maximum_require = findCoupenCode.maximum_order;
                        let discount_percentage = findCoupenCode.offer;


                        if (findInvoice.total_amount < minimum_require) {
                            //Minimum Amount Not avail
                            return { status: false, msg: `Minimum purchase of ${minimum_require} required.` }
                        } else if (findInvoice.total_amount > maximum_require) {
                            //Maximum Amount Crossed
                            return { status: false, msg: `Maximum purchase of ${maximum_require}.` }
                        } else {
                            let findTotalAmount = findInvoice.original_amount;
                            let suppose_discount = findTotalAmount - ((discount_percentage / 100) * findTotalAmount);

                            findInvoice.coupen_discount = suppose_discount
                            findInvoice.total_amount = suppose_discount
                            findInvoice.coupen_applied = coupen_code;
                            findCoupenCode.used_count++;
                            findUser.applied_coupen.push(coupen_code)

                            await findInvoice.save();
                            await findCoupenCode.save();
                            await findUser.save()
                            return { status: true, msg: `Coupon applied successfully.` }
                        }
                    }
                }

            } else {
                return { status: false, msg: `Invalid Coupen Code` }
            }
        } catch (e) {
            console.log(e)
            return { status: false, msg: `Something went wrong 2` }
        }
    },


    productReturnRequest: (order_id, user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderDocument = await OrdersModalDb.findById(order_id);
                if (user_id == orderDocument.user_id) {
                    if (orderDocument.status == const_data.ORDER_STATUS.DELIVERED) {


                        let findOrderDelivedDate = orderDocument?.shipping_history?.find((each) => each.status == const_data.ORDER_STATUS.DELIVERED);
                        if (findOrderDelivedDate) {

                            let timeExpire = new Date(findOrderDelivedDate?.date)
                            timeExpire.setDate(timeExpire.getDate() + 7)
                            timeExpire = timeExpire.getTime()

                            let currentTime = new Date().getTime();

                            if (timeExpire > currentTime) {
                                OrdersModalDb.updateOne({ _id: new mongoose.Types.ObjectId(order_id) }, {
                                    $set: {
                                        status: const_data.ORDER_STATUS.RETURNED_REQUEST
                                    },
                                    $push: {
                                        shipping_history: {
                                            status: const_data.ORDER_STATUS.RETURNED_REQUEST,
                                            date: new Date()
                                        }
                                    }
                                }).then(() => resolve(""))
                                    .catch((err) => reject(null))
                            } else {
                                reject("Product return only possible with in 7 days")
                            }
                        } else {
                            reject("Something went wrong.")
                        }

                    } else {
                        reject("Only delivered products can be returned.")
                    }
                } else {
                    reject("UnAuthorization")
                }
            } catch (e) {
                console.log(e)
                reject(null)
            }

        })
    },


    getUserCoupenCode: async (userid) => {
        try {

            let coupens = [];


            let couepnsFetch = await coupenModel.find({ status: true, valid_to: { $lt: new Date() } });
            console.log(couepnsFetch)
            if (couepnsFetch.length > 0) {
                for (let coupen of couepnsFetch) {
                    if (coupen?.individual_user && coupen?.individual_user?.length != 0) {
                        if (userid) {
                            if (coupen?.individual_user.includes(userid)) {
                                coupens.push(coupen)
                            }
                        }
                    } else {
                        coupens.push(coupen)
                    }
                }
            }

            return coupens;
        } catch (e) {
            return []
        }

    }


}




let userExternalHelper = {
    sendInvoiceOTP: (number, otp) => {
        console.log(number)
        return new Promise((resolve, reject) => {
            smsAPI.sendOTPSMS("User", number, otp).then(() => {
                resolve("SMS Sended")
            }).catch((err) => {
                console.log(err)
                reject("SMS Sending Failed")
            })
            // twilioConfig.messages.create({
            //     body: ` Your OTP for the checkout invoice is: ${otp}. Please use this OTP to complete your transaction.
            //     Thank you for choosing our service!
            //     Thank you`,
            //     from: '+19293322713',
            //     to: '+91' + number
            // }).then((sended) => {
            //     resolve("SMS Sended")
            // }).catch((err) => {
            //     reject("SMS Sending Failed")
            // })
        })
    }
}


module.exports = userHelperMethod