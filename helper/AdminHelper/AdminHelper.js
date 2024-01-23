const { default: mongoose } = require("mongoose")
const VendorModelDB = require("../../modals/Vendor")
let emailConfig = require("../../config/emailConfig")
let nodeMailer = require("nodemailer");
const ProductModel = require("../../modals/ProductModel");
const { MIN_STOCK, DOMAIN_URL, CHART_TYPE, ORDER_STATUS, PAYMENT_METHOD } = require("../../config/const");
const OrdersModalDb = require("../../modals/OrderModal");
const ImageModel = require("../../modals/ImageModel");
const fs = require("fs");
const UserModalDb = require("../../modals/userModal");
const CategoryModel = require("../../modals/CategoryModel");
const BannerModel = require("../../modals/BannerModel");
var xl = require('excel4node');
const PDFDocument = require('pdfkit');
const axios = require("axios");
const { default: HTMLToPDF } = require("convert-html-to-pdf/lib/models/HTMLToPDF");
const siteSettings = require("../../modals/SiteSettings");
const CoupenModel = require("../../modals/CoupenModel");
const commonHelper = require("../CommonHelper/CommonHelper");
const coupenModel = require("../../modals/CoupenModel");
const { default: ShortUniqueId } = require("short-unique-id");
const { getValidDateFormat } = require("../FunctionHelper/Helper");



let adminHelper = {
    vendorFind: (data) => {
        return new Promise((resolve, reject) => {
            VendorModelDB.findOne(data).then((vendor) => {
                resolve(vendor)
            }).catch((err) => {
                resolve(err)
            })
        })
    },


    updateAccount: async (email_address, phone_number, admin_id) => {

        let emailToken = crypto.randomBytes(64).toString("hex");
        let phoneOtp = Math.floor(1000 + Math.random() * 9000);
        let expireTime = new Date().getTime() + 1800000 //30 miniuts

        async function updateVendorPhone() {

            await VendorModelDB.updateOne({ _id: new mongoose.Types.ObjectId(admin_id) }, {
                phone_token: {
                    otp: phoneOtp,
                    expire_time: expireTime,
                    is_done: false,
                    new_phone: phone_number
                }
            })
        }

        async function updateVendorEmail() {
            let emailResetLink = "http://localhost:3001/update_email_address/" + emailToken;
            await VendorModelDB.updateOne({ _id: new mongoose.Types.ObjectId(admin_id) }, {
                email_token: {
                    token: emailToken,
                    expire_time: expireTime,
                    is_done: false,
                    new_email: email_address
                }
            })


        }

        try {
            let findVendor = await VendorModelDB.findById(admin_id);
            if (findVendor) {
                if (findVendor.email == email_address && findVendor.mobile == phone_number) {
                    return { status: false, msg: "Phone number or Email address must be diffrent from previous" }
                } else if (findVendor.email == email_address) {
                    //if phone need to change
                    await updateVendorPhone();
                } else if (findVendor.mobile == phone_number) {
                    //if email need to change
                    await updateVendorEmail();
                } else {
                    //if both need to change
                    await updateVendorPhone() && await updateVendorEmail();
                }
            }
        } catch (e) {

        }
    },


    updateVendor: (vendor_id, vendor_data) => {
        return new Promise((resolve, reject) => {
            VendorModelDB.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(vendor_id) }, { ...vendor_data }).then((update) => {
                resolve(update)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    adminResetPasswordLinkGenerator: async function (email, url, name, domain) {
        let mailerConfig = emailConfig.emailConfigObject;
        let mailTransport = nodeMailer.createTransport({
            service: mailerConfig.service,
            auth: mailerConfig.auth
        })



        let text = `Dear ${name} <br>,

        We received a request to reset your password for your ${domain} vendor panel. If you did not initiate this request, please ignore this email. Your account security is important to us <br>.
        
        If you did request a password reset, please follow the instructions below to reset your password:
        
        1. Click the following link to reset your password: <a href="${url}">Click here for reset password</a> <br>
         
        2. You will be directed to a page where you can create a new password for your account. <br>

        3. Password valid only for next 5 miniuts  <br>
        
        Please ensure that this request was initiated by you. If you have any concerns about the security of your account, please contact our super admin team immediately. <br>
        
        Thank you for using ${domain} <br>
        
        Best regards, <br>
        ${domain}
        `;



        let mailOption = {
            from: mailerConfig.auth.user,
            to: email,
            subject: 'Password Reset for Admin',
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


    updateManyProduct: (product_ids, data) => {
        return new Promise((resolve, reject) => {
            ProductModel.updateMany(
                {
                    _id: {
                        $in: product_ids
                    }
                },
                {
                    $set: {
                        ...data
                    }
                }
            ).then((updateProduct) => {
                resolve(updateProduct)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    updateProduct: (product_id, data) => {
        return new Promise((resolve, reject) => {
            ProductModel.updateOne(
                {
                    _id: new mongoose.Types.ObjectId(product_id)
                },
                {
                    $set: {
                        ...data
                    }
                }
            ).then((updateProduct) => {
                resolve(updateProduct)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    updateStock: (product_id, newStock) => {
        return new Promise((resolve, reject) => {
            ProductModel.updateOne(
                {
                    _id: new mongoose.Types.ObjectId(product_id)
                },
                {
                    $inc: {
                        stock: newStock
                    }
                }
            ).then((stockUpdate) => {
                resolve(stockUpdate)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    addProduct: (productData) => {
        return new Promise((resolve, reject) => {
            new ProductModel({ ...productData }).save().then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    getOutOfStock: () => {
        return new Promise((resolve, reject) => {
            ProductModel.find({ stock: { $lte: 1 } }).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    soonOutOfStock: () => {
        return new Promise((resolve, reject) => {
            ProductModel.find({ stock: { $lte: MIN_STOCK } }).populate("category").then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getAllOrders: () => {
        return new Promise((resolve, reject) => {
            OrdersModalDb.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: " _id ",
                        as: 'customer'
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "user_id",
                        foreignField: " _id ",
                        as: 'customer'
                    }
                }
            ]).then((order) => {
                resolve(order)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getOrdersByProductID: (product_id) => {
        return new Promise((resolve, reject) => {
            // OrdersModalDb.find({
            //     products: {
            //         $elemMatch: {
            //             product: new mongoose.Types.ObjectId(product_id)
            //         }
            //     }
            // }).then((order) => {
            //     resolve(order)
            // }).catch((err) => {
            //     reject(err)
            // })


            OrdersModalDb.find({
                'products.product': new mongoose.Types.ObjectId(product_id)
            }).then((orders) => {
                resolve(orders)
            }).catch((err) => {
                reject(err)
            });

        })
    },


    getOrdersByUser: async (user_id) => {
        try {
            let orders = await OrdersModalDb.find({ user_id: new mongoose.Types.ObjectId(user_id) })
            return orders
        } catch (e) {
            throw e;
        }
    },

    updateOrder: (order_id, edit_data) => {
        return new Promise((resolve, reject) => {

            OrdersModalDb.findByIdAndUpdate(order_id, edit_data).then(async (data) => {


                if (edit_data?.status == ORDER_STATUS.REFUND) {
                    console.log("Entered")
                    let thisOrder = await OrdersModalDb.findOne({ _id: new mongoose.Types.ObjectId(order_id) })
                    await commonHelper.addAmountToWallet(thisOrder?.user_id, thisOrder?.total, "REFUNDPAY", "Refund Amount");
                } else {
                    console.log("Not entered")
                }

                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    uploadImage: (image, file_size) => {
        return new Promise((resolve, reject) => {

            const randomString = require('crypto').randomBytes(6).toString('hex').toUpperCase();

            let imageName = randomString + image?.name

            image.mv("./public/images/web_images/" + imageName, (err) => {
                if (err) {

                    reject(err)
                } else {
                    new ImageModel({ image: imageName, file_size }).save().then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
                }
            })

        })
    },


    deleteImages: async (imageIds) => {

        console.log(imageIds)
        try {
            const imageIdArray = imageIds.split(',');

            const deletionPromises = [];

            for (const imageId of imageIdArray) {
                const item = await ImageModel.findById(imageId);

                if (item) {
                    const data = await ImageModel.findByIdAndRemove(imageId);

                    try {
                        await fs.promises.unlink("./public/images/web_images/" + item.image);
                    } catch (err) {
                        // Handle errors when deleting the file
                        console.error(`Error deleting file: ${err}`);
                    }

                    deletionPromises.push(data);
                } else {
                    // Handle cases where the image doesn't exist
                    console.error(`Image with ID ${imageId} not found.`);
                }
            }

            return deletionPromises;
        } catch (err) {
            // Handle any other errors
            console.error(`Error deleting images: ${err}`);
            throw err;
        }
    },


    getAllWebImages: () => {
        return new Promise((resolve, reject) => {
            ImageModel.find({}).then((images) => {
                resolve(images);
            }).catch((err) => {
                reject(err)
            })
        })
    },


    addUser: (userData) => {

        console.log(userData)
        return new Promise(async (resolve, reject) => {

            let userName = commonHelper.generateUserName(userData.first_name, userData.last_name);
            if (userName) {

                let { mobile, email } = userData;
                let findUser = await UserModalDb.findOne({
                    $or: [
                        { mobile: mobile, },
                        { email: email, }
                    ]
                })

                userData.username = userName;

                if (findUser) {
                    if (findUser.isOtpValidated) {
                        reject("User already exist");
                    } else {
                        userData._id = findUser._id
                    }
                }

                if (userData?._id) {
                    UserModalDb.updateOne({ _id: userData._id }).then(() => {
                        resolve("User updated success")
                    }).catch((err) => {
                        reject("Something went wrong")
                    })
                } else {
                    new UserModalDb(userData).save().then((user) => {
                        resolve("User inserted success")
                    }).catch((err) => {
                        console.log(err)
                        reject("Something went wrong")
                    })
                }
            } else {
                reject("Something went wrong")
            }
        })
    },

    updateUser: (user_ids, userData) => {
        return new Promise((resolve, reject) => {
            UserModalDb.updateMany(
                {
                    _id: {
                        $in: user_ids
                    }
                },
                userData
            ).then(() => {
                resolve("success")
            }).catch((err) => {
                reject("error")
            })
        })
    },

    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            UserModalDb.find({ is_delete: { $ne: true } }).then((users) => {
                resolve(users)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    addCategory: (categoryData) => {
        return new Promise((resolve, reject) => {
            new CategoryModel({ ...categoryData }).save().then((saved) => {
                resolve("Category created success")
            }).catch((err) => {
                console.log(err)
                reject("Category created failed")
            })
        })
    },



    updateCategory: (update_ids, update_data) => {
        return new Promise((resolve, reject) => {
            CategoryModel.updateMany(
                {
                    _id: {
                        $in: update_ids
                    }
                },
                {
                    $set: update_data
                }
            ).then(() => {
                resolve("")
            }).catch((err) => {
                reject(err)
            })
        })
    },

    deleteCategory: (delete_ids) => {
        return new Promise(async (resolve, reject) => {

            try {
                await ProductModel.updateMany({ category: { $in: delete_ids } }, { is_category_active: false })

                CategoryModel.deleteMany({
                    _id: {
                        $in: delete_ids
                    }
                }).then(() => {
                    resolve("Category Delete Success")
                }).catch((err) => {
                    reject("Category Delete Failed")
                })
            } catch (e) {
                reject("Category Delete Failed")
            }
        })
    },


    addBanner: (bannerData) => {
        return new Promise((resolve, reject) => {
            new BannerModel(bannerData).save().then(() => {
                resolve("Banner Created Success")
            }).catch((err) => {
                reject("Banner Created Failed")
            })
        })
    },


    editBanner: (id, editData) => {
        return new Promise((resolve, reject) => {
            BannerModel.updateMany({
                _id: {
                    $in: id
                },
            },
                {
                    $set: editData
                }).then(() => {
                    resolve("Banner Update Success")
                }).catch((err) => {
                    reject("Banner Update Failed")
                })

            BannerModel.findByIdAndUpdate(id, editData).then(() => {
                resolve("Banner Update Success")
            }).catch((err) => {
                reject("Banner Update Failed")
            })
        })
    },

    deleteBanner: (delete_id) => {
        return new Promise((resolve, reject) => {
            BannerModel.deleteMany({ _id: { $in: delete_id } }).then((dlt) => {
                resolve("Banner Delete Success")
            }).catch((err) => {
                resolve("Banner Delete Failed")
            })
        })
    },

    getAllBanner: () => {
        return new Promise((resolve, reject) => {
            BannerModel.find().then((dt) => {
                resolve(dt)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    generateSalesReport: (fromDate, endDate, category, status) => {
        return new Promise(async (resolve, reject) => {

            console.log(fromDate, endDate)
            var wb = new xl.Workbook();
            var ws = wb.addWorksheet('Sheet 1');
            var style = wb.createStyle({
                font: {
                    size: 12,

                },

                numberFormat: '$#,##0.00; ($#,##0.00); -',
            });


            function addBgColor(color) {
                return wb.createStyle({
                    fill: {
                        type: 'pattern',
                        fgColor: color,
                        patternType: 'solid',
                    }
                });
            }

            const column = [
                '#',
                'ORDER ID',
                'ORDER DATE',
                'SHIPPER NAME',
                'TOTAL',
                'STATUS',
                'INVOICE_ID',
                'PAYMENT TYPE',
                'DELIVERY TIME',
                'PRODUCT NAME',
                'PRODUCT ID',
                'QUANTITY',
                'VARIATION'
            ];

            let columnIndex = 1
            column.forEach((eachColumn) => {
                ws.cell(1, columnIndex++).string(eachColumn)
            })

            let orderFiltter = {}

            if (fromDate) {
                if (!orderFiltter.order_date) {
                    orderFiltter.order_date = {}
                }
                orderFiltter.order_date['$gte'] = fromDate
            }

            if (fromDate && endDate) {
                orderFiltter.order_date['$lte'] = endDate
            }

            if (status != '') {
                orderFiltter.status = status;
            }

            if (category != '') {
                orderFiltter["products.category"] = category;
            }

            console.log("Filtter is", orderFiltter)

            let categoryData;
            if (category) {
                categoryData = await CategoryModel.findById(category)
            }


            let rowIndex = 2;
            let indexRow = 1;

            let orderData = await OrdersModalDb.find(orderFiltter).populate("products.product")

            let sumOfTotal = await OrdersModalDb.aggregate([
                {
                    $match: orderFiltter
                },
                {
                    $group: {
                        _id: null,
                        total_amount: { $sum: { $toDouble: "$total" } }
                    }
                }
            ])

            console.log(status)



            orderData?.forEach((eachOrder) => {

                let dateToFormat = new Date(eachOrder.order_date)
                let dateFormat = getValidDateFormat(dateToFormat)

                ws.cell(rowIndex, 1).string(indexRow.toString() ?? " ").style(style);
                ws.cell(rowIndex, 2).string(eachOrder.order_id ?? " ").style(style);
                ws.cell(rowIndex, 3).string(dateFormat ?? " ").style(style);
                ws.cell(rowIndex, 4).string(eachOrder.shipper_name ?? " ").style(style);
                ws.cell(rowIndex, 5).string(eachOrder.total ?? " ").style(style);
                ws.cell(rowIndex, 6).string(eachOrder.status ?? " ").style(style);
                ws.cell(rowIndex, 7).string(eachOrder.invoice_id ?? " ").style(style);
                ws.cell(rowIndex, 8).string(eachOrder.payment_type ?? " ").style(style);
                ws.cell(rowIndex, 9).string(eachOrder.delivery_time ?? " ").style(style);
                ws.cell(rowIndex, 10).string(eachOrder.products?.product?.name ?? " ").style(style);
                ws.cell(rowIndex, 11).string(eachOrder.products?.product?._id.toString() ?? " ").style(style);
                ws.cell(rowIndex, 12).string(eachOrder.products?.quantity.toString() ?? " ").style(style);
                ws.cell(rowIndex, 13).string(eachOrder.products?.variation.toString() ?? " ").style(style);
                indexRow++;
                rowIndex++;
            })

            ws.cell(rowIndex + 3, 1).string("Summary").style(addBgColor("#16a758"));
            ws.cell(rowIndex + 4, 1).string("Number of order").style(addBgColor("#CDDC39"));
            ws.cell(rowIndex + 5, 1).string("Total amount").style(addBgColor("#CDDC39"));
            ws.cell(rowIndex + 6, 1).string("Date From ").style(addBgColor("#CDDC39"));
            ws.cell(rowIndex + 7, 1).string("Date To ").style(addBgColor("#CDDC39"));
            ws.cell(rowIndex + 8, 1).string("Category ").style(addBgColor("#CDDC39"));
            ws.cell(rowIndex + 9, 1).string("Status ").style(addBgColor("#CDDC39"));


            ws.cell(rowIndex + 4, 2).string((indexRow - 1).toString()).style(addBgColor("#CDDC99"));
            ws.cell(rowIndex + 5, 2).string(sumOfTotal[0]?.total_amount.toString()).style(addBgColor("#CDDC99"));
            ws.cell(rowIndex + 6, 2).string((fromDate != null || fromDate != '') ? getValidDateFormat(fromDate) : "All Date").style(addBgColor("#CDDC99"));
            ws.cell(rowIndex + 7, 2).string((endDate != null || endDate != '') ? getValidDateFormat(endDate) : "All Date").style(addBgColor("#CDDC99"));
            ws.cell(rowIndex + 8, 2).string(category ? categoryData?.name : "All Category ").style(addBgColor("#CDDC99"));
            ws.cell(rowIndex + 9, 2).string(status ?? "All Status").style(addBgColor("#CDDC99"));





            resolve(wb)

        })

    },


    generateSalesReportAsPdf: (fromDate, endDate, category, status) => {
        return new Promise(async (resolve, reject) => {
            try {



                let orderFiltter = {
                    _id: {
                        $ne: null
                    }
                }

                if (fromDate != '') {
                    orderFiltter.order_date = {}
                    orderFiltter.order_date.$gte = fromDate
                }

                if (endDate != '') {
                    if (!orderFiltter.order_date) {
                        orderFiltter.order_date = {}
                    }
                    orderFiltter.order_date.$lte = endDate;
                }

                if (status != '') {
                    orderFiltter.status = status;
                }

                if (category != '') {
                    orderFiltter["products.category"] = category;
                }


                let orderDatas = await OrdersModalDb.find(orderFiltter).populate("products.product")

                const salesData = await OrdersModalDb.aggregate([
                    { $match: orderFiltter },
                    {
                        $group: {
                            _id: null,
                            totalSum: { $sum: { $toDouble: '$total' } }
                        }
                    }
                ]);




                let fromDateStatus = fromDate == "" ? "All time" : fromDate
                let endDateStatus = endDate == "" ? "All time" : endDate
                let categoryStatus = category == "" ? "All time" : category
                let numberOfSales = orderDatas.length;
                let totalSalesPrice = salesData[0]?.totalSum

                const salesRows = orderDatas.map(function (eachSales) {
                    let dateToFormat = new Date(eachSales.order_date)
                    let dateFormat = dateToFormat.getFullYear() + "/" + dateToFormat.getMonth() + "/" + dateToFormat.getDate()

                    return ` <tr>
                    <td>${dateFormat}</td>
                    <td>${eachSales.shipper_name}</td>
                    <td>${Number(eachSales.total).toFixed(2)}</td>
                    <td>${eachSales.status}</td>
                    <td>${eachSales.payment_type}</td>
                    <td>${eachSales.products?.product?.name}</td>
                    <td>${eachSales.products.quantity}</td>
                    <td>${eachSales.products.variation}</td>
                </tr>
            `}).join(' ');




                if (orderDatas.length > 0) {




                    let htmlSales = `<!DOCTYPE html>
                        <html>
                        <head>
                            <title>Sales Report</title>
                            <style>
                                /* styles.css file */
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }
                        
                        .container {
                            width: 95%;
                            margin: 20px auto;
                        }
                        
                        h1 {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                         
                        
                        .sales-table {
                            width: 100%;
                            border-collapse: collapse;
                            background-color: #fff; 
                        }
                        
                        .sales-table th,
                        .sales-table td {
                            padding: 12px;
                            text-align: left;
                             border: 1px solid #dddddd; /* Adding border for each cell */
                        }
                        
                        .sales-table th {
                            background-color: #acb9ca;
                            font-weight: bold;
                        }
                        
                        .sales-table tbody tr:nth-child(even) {
                            background-color: #e9eff2;
                        }
                        
                        .sales-table tbody tr:hover {
                            background-color: #e0e0e0;
                        }
                         header {  
                            margin-bottom: 20px;
                        }
                        
                        h1 {
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        
                        .header-section {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 20px;
                        }
                        
                        .left-section,
                        .right-section {
                            width: 50%; 
                        }
                        
                        .left-section h2,
                        .right-section h2 {
                            font-size: 18px;
                            margin-bottom: 8px;
                        }
                        
                        .left-section{
                            text-align:left;
                        }
                        
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                  <header>
                                    <h1>Sales Report</h1>
                                    <div class="header-section">
                                        <div class="left-section">
                                            <h2>Sales</h2>
                                            <p>Date From: ${fromDateStatus}</p>
                                            <p>Date To: ${endDateStatus}</p>
                                            <p>Category: ${categoryStatus}</p>
                                        </div>
                                        <div class="right-section">
                                            <h2>Summary</h2>
                                            <p>Total Number of Sales: ${numberOfSales}</p>
                                            <p>Total Sales Amount: ${totalSalesPrice}</p>
                                        </div>
                                    </div>
                                </header>
                        
                        
                                <table class="sales-table">
                                    <thead>
                                        <tr>
                                            <th>Order Date</th>
                                            <th>Shipper Name</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Payment Type</th>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Variation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${salesRows}
                                    </tbody>
                                </table>
                            </div>
                        </body>
                        </html>
                        `



                    let htmlToPdf = new HTMLToPDF(htmlSales)
                    const pdf = await htmlToPdf.convert({
                        waitForNetworkIdle: true,
                        browserOptions: {
                            defaultViewport: {
                                width: 4000, // Increase the width as needed
                                height: 1080
                            }
                        },
                        pdfOptions: {
                            height: 1200,
                            width: 2000, // Increase the width as needed
                            timeout: 0
                        }
                    });
                    resolve(pdf)
                } else {
                    reject("No invoice found")
                }

            } catch (e) {
                reject(e)
            }
        });
    },


    generateProductSalesReport: (product_id) => {
        return new Promise(async (resolve, reject) => {
            try {



                let orderFiltter = {
                    _id: {
                        $ne: null
                    }
                }

                if (fromDate != '') {
                    orderFiltter.order_date = {}
                    orderFiltter.order_date.$gte = fromDate
                }

                if (endDate != '') {
                    if (!orderFiltter.order_date) {
                        orderFiltter.order_date = {}
                    }
                    orderFiltter.order_date.$lte = endDate;
                }

                if (status != '') {
                    orderFiltter.status = status;
                }

                if (category != '') {
                    orderFiltter["products.category"] = category;
                }


                let orderDatas = await OrdersModalDb.find(orderFiltter).populate("products.product")

                const salesData = await OrdersModalDb.aggregate([
                    { $match: orderFiltter },
                    {
                        $group: {
                            _id: null,
                            totalSum: { $sum: { $toDouble: '$total' } }
                        }
                    }
                ]);




                let fromDateStatus = fromDate == "" ? "All time" : fromDate
                let endDateStatus = endDate == "" ? "All time" : endDate
                let categoryStatus = category == "" ? "All time" : category
                let numberOfSales = orderDatas.length;
                let totalSalesPrice = salesData[0]?.totalSum

                const salesRows = orderDatas.map(function (eachSales) {
                    let dateToFormat = new Date(eachSales.order_date)
                    let dateFormat = dateToFormat.getFullYear() + "/" + dateToFormat.getMonth() + "/" + dateToFormat.getDate()

                    return ` <tr>
                    <td>${dateFormat}</td>
                    <td>${eachSales.shipper_name}</td>
                    <td>${Number(eachSales.total).toFixed(2)}</td>
                    <td>${eachSales.status}</td>
                    <td>${eachSales.payment_type}</td>
                    <td>${eachSales.products?.product?.name}</td>
                    <td>${eachSales.products.quantity}</td>
                    <td>${eachSales.products.variation}</td>
                </tr>
            `}).join(' ');




                if (orderDatas.length > 0) {




                    let htmlSales = `<!DOCTYPE html>
                        <html>
                        <head>
                            <title>Sales Report</title>
                            <style>
                                /* styles.css file */
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }
                        
                        .container {
                            width: 95%;
                            margin: 20px auto;
                        }
                        
                        h1 {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                         
                        
                        .sales-table {
                            width: 100%;
                            border-collapse: collapse;
                            background-color: #fff; 
                        }
                        
                        .sales-table th,
                        .sales-table td {
                            padding: 12px;
                            text-align: left;
                             border: 1px solid #dddddd; /* Adding border for each cell */
                        }
                        
                        .sales-table th {
                            background-color: #acb9ca;
                            font-weight: bold;
                        }
                        
                        .sales-table tbody tr:nth-child(even) {
                            background-color: #e9eff2;
                        }
                        
                        .sales-table tbody tr:hover {
                            background-color: #e0e0e0;
                        }
                         header {  
                            margin-bottom: 20px;
                        }
                        
                        h1 {
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        
                        .header-section {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 20px;
                        }
                        
                        .left-section,
                        .right-section {
                            width: 50%; 
                        }
                        
                        .left-section h2,
                        .right-section h2 {
                            font-size: 18px;
                            margin-bottom: 8px;
                        }
                        
                        .left-section{
                            text-align:left;
                        }
                        
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                  <header>
                                    <h1>Sales Report</h1>
                                    <div class="header-section">
                                        <div class="left-section">
                                            <h2>Sales</h2>
                                            <p>Date From: ${fromDateStatus}</p>
                                            <p>Date To: ${endDateStatus}</p>
                                            <p>Category: ${categoryStatus}</p>
                                        </div>
                                        <div class="right-section">
                                            <h2>Summary</h2>
                                            <p>Total Number of Sales: ${numberOfSales}</p>
                                            <p>Total Sales Amount: ${totalSalesPrice}</p>
                                        </div>
                                    </div>
                                </header>
                        
                        
                                <table class="sales-table">
                                    <thead>
                                        <tr>
                                            <th>Order Date</th>
                                            <th>Shipper Name</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Payment Type</th>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Variation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${salesRows}
                                    </tbody>
                                </table>
                            </div>
                        </body>
                        </html>
                        `



                    let htmlToPdf = new HTMLToPDF(htmlSales)
                    const pdf = await htmlToPdf.convert({
                        waitForNetworkIdle: true,
                        browserOptions: {
                            defaultViewport: {
                                width: 4000, // Increase the width as needed
                                height: 1080
                            }
                        },
                        pdfOptions: {
                            height: 1200,
                            width: 2000, // Increase the width as needed
                            timeout: 0
                        }
                    });
                    resolve(pdf)
                } else {
                    reject("No invoice found")
                }

            } catch (e) {
                reject(e)
            }
        });
    },


    getSiteStatics: (start_date, end_date, chart_type) => {

        // chart_type = CHART_TYPE.DAILY;


        return new Promise(async (resolve, reject) => {

            if (start_date != null && start_date != 'null') {
                start_date = new Date(start_date);
            } else {
                start_date = new Date();
                start_date = new Date(start_date.setDate(start_date.getDate() - 1000))
            }

            if (end_date != null && end_date != "null") {
                end_date = new Date(end_date);
            } else {
                end_date = new Date();
            }


            let userGraph = [];
            let categoryGraph = []
            let orderGraph = []

            let mongoFiltterUser = {}
            let mongoProjectUser = {}

            let mongoFiltterOrder = {}
            let mongoProjectOrder = {}

            if (chart_type == CHART_TYPE.DAILY) {
                let currentDate = new Date(start_date)

                while (currentDate <= end_date) {
                    let dates = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear();
                    userGraph.push({
                        date: dates,
                        count: 0
                    })
                    orderGraph.push({
                        date: dates,
                        count: 0
                    })
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                mongoFiltterUser = {
                    year: { $year: "$joining_date" },
                    month: { $month: "$joining_date" },
                    day: { $dayOfMonth: "$joining_date" }
                };

                mongoFiltterOrder = {
                    year: { $year: "$order_date" },
                    month: { $month: "$order_date" },
                    day: { $dayOfMonth: "$order_date" }
                };

                mongoProjectUser = {
                    $concat: [{ $toString: "$_id.day" }, "-", { $toString: "$_id.month" }, "-", { $toString: "$_id.year" }]
                };

                mongoProjectOrder = {
                    $concat: [{ $toString: "$_id.day" }, "-", { $toString: "$_id.month" }, "-", { $toString: "$_id.year" }]
                };


            } else if (chart_type == CHART_TYPE.MONTHLY) {
                let currentDate = new Date(start_date)

                while (currentDate <= end_date) {
                    let dates = (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear();
                    userGraph.push({
                        date: dates,
                        count: 0
                    })
                    orderGraph.push({
                        date: dates,
                        count: 0
                    })
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
                mongoFiltterUser = {
                    year: { $year: "$joining_date" },
                    month: { $month: "$joining_date" },
                };

                mongoFiltterOrder = {
                    year: { $year: "$order_date" },
                    month: { $month: "$order_date" },
                };

                mongoProjectUser = {
                    $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.year" }]
                };

                mongoProjectOrder = {
                    $concat: [{ $toString: "$_id.day" }, "-", { $toString: "$_id.month" }, "-", { $toString: "$_id.year" }]
                };


            } else if (chart_type == CHART_TYPE.YEARLY) {
                let currentDate = new Date(start_date)

                while (currentDate <= end_date) {
                    let dates = currentDate.getFullYear();
                    userGraph.push({
                        date: dates,
                        count: 0
                    })
                    orderGraph.push({
                        date: dates,
                        count: 0
                    })
                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                }

                mongoFiltterUser = {
                    year: { $year: "$joining_date" },
                };

                mongoFiltterOrder = {
                    year: { $year: "$order_date" },
                };

                mongoProjectUser = {
                    $concat: [{ $toString: "$_id.year" }]
                };

                mongoProjectOrder = {
                    $concat: [{ $toString: "$_id.year" }]
                };

            }

            try {



                let userProf = await UserModalDb.aggregate([
                    {
                        $match: {
                            joining_date: {
                                $gte: start_date,
                                $lte: end_date
                            }
                        }
                    },
                    {
                        $group: {
                            _id: mongoFiltterUser,
                            count: { $sum: 1 },
                        }
                    },
                    {
                        $project: {
                            date: mongoProjectUser,
                            _id: 0,
                            count: 1
                        }
                    }
                ])

                let orderProf = await OrdersModalDb.aggregate([
                    {
                        $match: {
                            order_date: {
                                $gte: start_date,
                                $lte: end_date
                            }
                        }
                    },
                    {
                        $group: {
                            _id: mongoFiltterOrder,
                            count: { $sum: 1 },
                        }
                    },
                    {
                        $project: {
                            date: mongoProjectOrder,
                            _id: 0,
                            count: 1
                        }
                    }
                ])

                let userData = await UserModalDb.find({
                    joining_date: {
                        $gte: start_date,
                        $lte: end_date
                    }
                });



                let categoryProduct = await CategoryModel.find({
                    category_inserted_date: {
                        $gte: start_date,
                        $lte: end_date
                    }
                });

                categoryProduct.forEach((each) => {
                    categoryGraph.push({
                        name: each.name,
                        count: 0.1
                    })
                })

                let productsData = await ProductModel.find({
                    product_inserted_date: {
                        $gte: start_date,
                        $lte: end_date
                    }
                }).populate("category");

                let images = await ImageModel.find({
                    image_inserted_date: {
                        $gte: start_date,
                        $lte: end_date
                    }
                });

                productsData.forEach((product) => {
                    if (product?.category) {
                        let categoryName = product?.category?.name
                        let findCategory = categoryGraph.find((each) => each.name == categoryName);
                        if (findCategory) {
                            if (findCategory.count == 0.1) {
                                findCategory.count = 1;
                            } else {
                                findCategory.count++;
                            }

                        }
                    }
                })

                userProf.forEach((eachColumn) => {
                    let findUser = userGraph.find((each) => each.date == eachColumn.date);
                    if (findUser) {
                        findUser.count++;
                    }
                })

                orderProf.forEach((eachColumn) => {
                    // orderGraph[eachColumn.date] = eachColumn.count
                    let findOrder = orderGraph.find((each) => each.date == eachColumn.date);
                    if (findOrder) {
                        findOrder.count++;
                    }
                })

                let outPut = {
                    users_graph: userGraph,
                    orders: orderGraph,
                    category: categoryGraph,
                    users: userData,
                    site_statics: {
                        number_users: userData.length,
                        number_of_product: productsData.length,
                        number_of_category: categoryProduct.length,
                        number_of_images: images.length,
                        number_of_orders: Object.values(orderGraph).reduce((acc, val) => acc + val.count, 0)
                    }
                }
                resolve(outPut)


            } catch (e) {
                reject(e)
            }
        })
    },


    updateSiteSettings: (site_data) => {
        return new Promise((resolve, reject) => {
            siteSettings.updateMany({}, { $set: site_data }).then(() => {
                resolve("updated");
            }).catch((err) => {
                reject("Something went wrong")
            })
        })
    },

    getSiteBasicSettings: async () => {
        try {
            let siteData = await siteSettings.findOne({});
            return siteData;
        } catch (e) {
            return false;
        }
    },

    addCoupenCode: (newCoupen) => {

        return new Promise((resolve, reject) => {
            new CoupenModel(newCoupen).save().then(() => {
                resolve("Coupen added success")
            }).catch((err) => {
                reject(err)
            })
        })
    },

    editCoupenCode: (edit_id, editCoupen) => {
        return new Promise((resolve, reject) => {

            CoupenModel.updateMany({
                _id: {
                    $in: edit_id
                }
            },
                {
                    $set: editCoupen
                }).then(() => {
                    resolve("Updated")
                }).catch((err) => {
                    reject("Error")
                })

        })
    },

    deleteCoupenCode: (delete_id) => {
        return new Promise((resolve, reject) => {

            CoupenModel.deleteMany({
                _id: {
                    $in: delete_id
                }
            }).then(() => {
                resolve("Delete success")
            }).catch((err) => {
                reject("Delete failed")
            })

        })
    },


    getSingleUser: (user_id) => {
        return new Promise((resolve, reject) => {
            UserModalDb.findById(user_id).then((user) => {
                resolve(user)
            }).catch((err) => {
                reject(err);
            })
        })
    },

    generateIndividualCoupen: async (user_id, name, description, offer, is_percentage, minimum_order, maximum_order, valid_from, valid_to,) => {
        try {

            let coupen_code = new ShortUniqueId({ length: 7 }).rnd().toUpperCase()

            await new coupenModel({ name, description, offer, is_percentage, individual_user: [user_id], minimum_order, maximum_order, valid_from, valid_to, status: true, code: coupen_code, createdBy: "AUTO" }).save()
            let userUpdate = await UserModalDb.findById(user_id)
            userUpdate.individual_coupen.push(coupen_code)
            await userUpdate.save()
        } catch (e) {
            throw e
        }
    }



}

module.exports = adminHelper;