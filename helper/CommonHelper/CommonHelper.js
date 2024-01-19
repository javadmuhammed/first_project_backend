
const { Mongoose, default: mongoose } = require("mongoose");
let UserModel = require("../../modals/userModal")
let WalletModel = require("../../modals/WalletHistory");
const OrdersModalDb = require("../../modals/OrderModal");
const { addressModelDB } = require("../../modals/AddressModel");
const ProductModel = require("../../modals/ProductModel");
const UserModalDb = require("../../modals/userModal");
const { PRODUCT_OPTION, ORDER_STATUS, PAYMENT_METHOD, PRODUCT_VARIATION, GET_KEY_BY_VALUE, DOMAIN_URL } = require("../../config/const");
const InvoiceModel = require("../../modals/InvoiceModel");
const CategoryModel = require("../../modals/CategoryModel");
const CartModel = require("../../modals/CartModel");
const invoiceIt = require('@rimiti/invoice-it').default;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const axios = require("axios")
const qr = require("qrcode");
const { createCanvas } = require('canvas');
const ModalWallet = require("../../modals/WalletHistory");
const coupenModel = require("../../modals/CoupenModel");
const BannerModel = require("../../modals/BannerModel");
const { getValidDateFormat } = require("../FunctionHelper/Helper");
const HTMLToPDF = require("convert-html-to-pdf").default

let commonHelper = {
    findSingleUser: function (userid) {
        return new Promise((resolve, reject) => {
            UserModel.findById(userid).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    getUserByJwt: (jwt) => {
        return new Promise((resolve, reject) => {
            UserModalDb.findOne({
                access_token: jwt, status: {
                    $nin: ['false', false]
                }
            }).then((data) => {
                if (data) {
                    resolve(data)
                }else{
                    reject("No data found")
                }
            }).catch((err) => {
                reject(err)
            })
        })
    },

    getUserWalletHistory: (userid) => {
        return new Promise((resolve, reject) => {
            ModalWallet.findOne({ user_id: new mongoose.Types.ObjectId(userid) }).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    getSingleOrder: (order_id) => {
        console.log("Order ID" + order_id)
        return new Promise((resolve, reject) => {
            OrdersModalDb.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(order_id)
                    },
                },
                {
                    $lookup: {
                        localField: "products.product",
                        foreignField: "_id",
                        from: "products",
                        as: "product"
                    },
                },
                {
                    $addFields: {
                        product: { $arrayElemAt: ["$product", 0] }
                    }
                }
            ]).then((data) => {
                resolve(data[0])
            }).catch((err) => {
                reject(err)
            })
        })
    },

    update_order: (order_id, data) => {
        console.log(order_id, data)
        return new Promise((resolve, reject) => {
            OrdersModalDb.updateOne({ _id: new mongoose.Types.ObjectId(order_id) }, data).then((datas) => {
                console.log(datas, data)
                resolve(datas)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    cancelOrderHelper: (user_id, product_id, order_id) => {
        return new Promise((resolve, reject) => {
            OrdersModalDb.aggregate(
                [
                    {
                        $lookup: {
                            from: 'users',
                            localField: "user_id",
                            foreignField: "_id",
                            as: "user_data"
                        },
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "user_id",
                            foreignField: "_id",
                            as: "user_data"
                        }
                    }
                ]
            )
        })
    },



    getSingleAddress: function (address_id) {
        return new Promise((resolve, reject) => {
            addressModelDB.findOne({ _id: new mongoose.Types.ObjectId(address_id) }).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        })
    },




    getAllProduct: (filter = {}) => {
        return new Promise(async (resolve, reject) => {
            ProductModel.find(filter).populate("category").then(products => {
                resolve(products)
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        })
    },


    getSingleProduct: (filtter) => {
        return new Promise((resolve, reject) => {
            ProductModel.findOne(filtter).populate("category").then((product) => {
                resolve(product)
            }).catch((err) => {
                resolve(err)
            })
        })
    },


    getProductByCondition: (condition) => {
        return new Promise((resolve, reject) => {
            ProductModel.find({ ...condition }).then((product) => {
                resolve(product)
            }).catch((err) => {
                resolve(err)
            })

        })
    },

    getProductOption: (limit, userId, filtter = {}) => {
        return new Promise((resolve, reject) => {

            if (Object.values(PRODUCT_OPTION).includes(filtter?.option)) {

                ProductModel.find({ ...filtter }).limit(limit).populate("category").then((products) => {
                    if (userId) {

                        CartModel.findOne({ user_id: new mongoose.Types.ObjectId(userId) }).then((cartData) => {

                            if (cartData) {

                                let productData = products.map((productItem) => {

                                    let productNew = { ...productItem._doc }
                                    let cartItems = cartData.products.find((cartProductItem) => {
                                        let objId = new Object();
                                        objId.cart_product = cartProductItem.product_id;
                                        return objId.cart_product.equals(productItem._id)
                                    });

                                    if (cartItems) {
                                        productNew.quantityInCart = cartItems.quantity
                                    } else {
                                        productNew.quantityInCart = 1
                                    }

                                    return productNew;
                                })

                                resolve(productData);
                            } else {
                                resolve(products)
                            }
                        }).catch((err) => {
                            resolve(products)
                        })
                    } else {

                        resolve(products)
                    }
                }).catch((err) => {
                    reject(err)
                })
                // ProductModel.find({ option }).limit(limit).populate("category").then(products => {

                //     if (userId) {


                //         CartModel.findOne({ user_id: new mongoose.Types.ObjectId(userId) }).then(cart => {
                //             if (cart) {

                //                 console.log("Originla Product", products)

                //                 const productsWithCartInfo = products.map(function (product) {

                //                     let newProduct = product;

                //                     const cartItem = cart?.products.find(function (item) {
                //                         console.log("Cart items",item)
                //                         return item.product_id == product._id
                //                     })



                //                     if (cartItem) {
                //                         newProduct = { ...product._doc, quantityInCart: cartItem.quantity };
                //                     }else{
                //                         console.log("cart",cartItem)
                //                     }

                //                     return newProduct;
                //                 });

                //                 console.log("Product", productsWithCartInfo)
                //                 resolve(productsWithCartInfo);

                //             } else {
                //                 //  console.log("This work")
                //                 resolve(products)
                //             }
                //         })
                //             .catch(err => {
                //                 console.log(err);
                //                 reject(err);
                //             });
                //     } else {
                //         resolve(products);
                //     }
                // }).catch(err => {
                //     console.log(err);
                //     reject(err);
                // });
            } else {
                reject("Option do not match");
            }
        })
    },

    filterProduct: (sort, betweenFrom, betweenTo, category, optionCategory) => {
        return new Promise((resolve, reject) => {
            ProductModel.find({
                sale_price: {
                    $gte: betweenFrom,
                    $lte: betweenTo
                },
                category_id: new mongoose.Types.ObjectId(category),
                option: optionCategory
            }).then((productItems) => {
                resolve(productItems)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    getSingleOrder: (order_id) => {
        return new Promise((resolve, reject) => {
            OrdersModalDb.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(order_id)
                    }
                },
                {
                    $lookup: {
                        localField: "user_id",
                        foreignField: "_id",
                        from: "users",
                        as: "user"
                    }
                },
                {
                    $lookup: {
                        localField: "products.product",
                        foreignField: "_id",
                        from: "products",
                        as: "product"
                    }
                },
                {
                    $addFields: {
                        product: { $arrayElemAt: ["$product", 0] }
                    }
                },
                {
                    $addFields: {
                        user: { $arrayElemAt: ["$user", 0] }
                    }
                }
            ]).then((order) => {
                resolve(order[0])
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getSingleOrderByNumber: (order_number) => {
        return new Promise((resolve, reject) => {
            OrdersModalDb.aggregate(
                [
                    {
                        $match: { order_id: order_number }
                    },
                    {
                        $lookup: {
                            from: "products",
                            as: "product",
                            localField: "products.product",
                            foreignField: "_id"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            as: "user",
                            localField: "user_id",
                            foreignField: "_id"
                        }
                    },
                    {
                        $addFields: {
                            product: {
                                $arrayElemAt: ['$product', 0]
                            }
                        }
                    },
                    {
                        $addFields: {
                            user: {
                                $arrayElemAt: ['$user', 0]
                            }
                        }
                    }
                ]
            ).then((singleOrder) => {
                resolve(singleOrder)
            }).catch((err) => {
                console.log(err)
                reject(err)
            })
        })
    },


    downloadInvoice: (invoice_id) => {

        return new Promise(async (resolve, reject) => {
            try {

                let ordersData = await OrdersModalDb.findById(invoice_id);
                console.log(ordersData)

                if (ordersData) {
                    let productData = await ProductModel.findById(ordersData?.products?.product);
                    ordersData.product = productData


                    let dateToFormat = new Date(ordersData?.order_date)
                    let dateFormat = getValidDateFormat(dateToFormat)

                    function getDeliveryHTML() {
                        return `
                        <html lang="en">
                        <head>
                          <meta charset="utf-8">
                          <title>Example 1</title>
                          <style>
                          .clearfix:after {
                            content: "";
                            display: table;
                            clear: both;
                          }
                          
                          a {
                            color: #5D6975;
                            text-decoration: underline;
                          }
                          
                          body {
                            position: relative;
                            width: 21cm;  
                            height: 29.7cm; 
                            margin: 0 auto; 
                            color: #001028;
                            background: #FFFFFF; 
                            font-family: Arial, sans-serif; 
                            font-size: 12px; 
                            font-family: Arial;
                          }
                          
                          header {
                            padding: 10px 0;
                            margin-bottom: 30px;
                          }
                          
                          #logo {
                            text-align: center;
                            margin-bottom: 10px;
                          }
                          
                          #logo img {
                            width: 90px;
                          }
                          
                          h1 {
                            border-top: 1px solid  #5D6975;
                            border-bottom: 1px solid  #5D6975;
                            color: #5D6975;
                            font-size: 2.4em;
                            line-height: 1.4em;
                            font-weight: normal;
                            text-align: center;
                            margin: 0 0 20px 0;
                            background: url(dimension.png);
                          }
                          
                          #project {
                            float: left;
                          }
                          
                          #project span {
                            color: #5D6975;
                            text-align: right;
                            width: 52px;
                            margin-right: 10px;
                            display: inline-block;
                            font-size: 0.8em;
                          }
                          
                          #company {
                            float: right;
                            text-align: right;
                          }
                          
                          #project div,
                          #company div {
                            white-space: nowrap;        
                          }
                          
                          table {
                            width: 100%;
                            border-collapse: collapse;
                            border-spacing: 0;
                            margin-bottom: 20px;
                          }
                          
                          table tr:nth-child(2n-1) td {
                            background: #F5F5F5;
                            font-size:14px;
                          }
                          
                          table th,
                          table td {
                            text-align: center;
                          }
                          
                          table th {
                            padding: 5px 20px;
                            color: #5D6975;
                            border-bottom: 1px solid #C1CED9;
                            white-space: nowrap;        
                            font-weight: normal;
                          }
                          
                          table .service,
                          table .desc {
                            text-align: left;
                          }
                          
                          table td {
                            padding: 20px;
                            text-align: right;
                          }
                          
                          table td.service,
                          table td.desc {
                            vertical-align: top;
                          }
                          
                          table td.unit,
                          table td.qty,
                          table td.total {
                            font-size: 1.2em;
                          }
                          
                          table td.grand {
                            border-top: 1px solid #5D6975;;
                          }
                          
                          #notices .notice {
                            color: #5D6975;
                            font-size: 1.2em;
                          }
                          
                          footer {
                            color: #5D6975;
                            width: 100%;
                            height: 30px;
                            position: absolute;
                            bottom: 0;
                            border-top: 1px solid #C1CED9;
                            padding: 8px 0;
                            text-align: center;
                          }
                          </style>

                        </head>
                        <body>
                          <header class="clearfix">
                            <div id="logo">
                              <img src="http://localhost:3000/static/media/logo.6ffce358aec63c0eed0d5e7745d5d621.svg">
                            </div>
                            <h1>INVOICE</h1>
                            <div id="company" class="clearfix">
                              <div>Veguess</div>
                              <div>Edathuruthikaran Holdings / Kundannoor, Maradu, Ernakulam</div>
                              <div>+91 9744727684 </div>
                              <div>Kerala 682304</div>
                            </div>
                            <div id="project"> 
                              <div><span>Name</span> ${ordersData?.address?.name}</div>
                              <div><span>Address</span> ${ordersData?.address?.address}</div>
                              <div><span>EMAIL</span> <a href="mailto:${ordersData?.address?.email}">${ordersData?.address?.email}</a></div>
                              <div><span>Date</span> ${dateFormat}</div>
                              <div><span>Order ID</span> ${ordersData?.order_id}</div>
                            </div>
                          </header>
                          <main>
                            <table>
                              <thead>
                                <tr>
                                  <th class="service">Product</th>
                                  <th class="desc">Title</th>
                                  <th>Quantity</th>
                                  <th>Amount</th>
                                  <th>Discount</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                             
                                <tr>
                                  <td class="service">${ordersData?.product?.name} - ${GET_KEY_BY_VALUE(PRODUCT_VARIATION, ordersData.products.variation)} -  QTY: ${ordersData.products.quantity}</td>
                                  <td class="desc">${ordersData?.product?.name}</td>
                                  <td class="unit">${ordersData?.products?.quantity}</td>
                                  <td class="qty">${ordersData?.product?.sale_price}</td>
                                  <td class="total">${ordersData?.product?.original_price - ordersData?.product?.sale_price}</td>
                                  <td class="total">${ordersData?.product?.sale_price * ordersData?.products?.quantity}</td>
                                </tr> 
                                  
                                <tr>
                                  <td colspan="4" class="grand total">GRAND TOTAL</td>
                                  <td class="grand total">${ordersData?.total}</td>
                                </tr>
                              </tbody>
                            </table>
                            <div id="notices">
                              <div>NOTICE:</div>
                              <div class="notice">We try to deliver perfectly each and every time. But in the off-chance that you need to return the item, please do
                              so with the original Brand box/price</div>
                            </div>
                          </main>
                          <footer>
                            Invoice was created on a computer and is valid without the signature and seal.
                          </footer>
                        </body>
                      </html>
                    `
                    }

                    let pdfHtml = getDeliveryHTML()
                    let htmlToPdf = new HTMLToPDF(pdfHtml)
                    const pdf = await htmlToPdf.convert({ waitForNetworkIdle: true, browserOptions: { defaultViewport: { width: 1920, height: 1080 } }, pdfOptions: { height: 1200, width: 900, timeout: 0 } })
                    resolve(pdf)
                } else {
                    reject("No invoice found")
                }

            } catch (e) {
                reject(e)
            }
        });
    },


    getProductByCategory: (category_id) => {
        return new Promise((resolve, reject) => {
            ProductModel.find({ category: category_id }).then((products) => {
                resolve(products)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getSingleCategory: (category_id) => {
        return new Promise((resolve, reject) => {
            CategoryModel.findById(category_id).then((category) => {
                resolve(category)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getAllCategory: async (count, skip) => {
        let filtter = [{
            $match: {
                _id: {
                    $ne: null
                }
            }
        }];

        if (count) {
            filtter.push({ $limit: count })
        }
        if (skip) {
            filtter.push({ $skip: skip })
        }

        try {
            let categoryData = await CategoryModel.aggregate(filtter)
            return categoryData
        } catch (e) {
            console.log(e)
            return false;
        }

        // return new Promise((resolve, reject) => {

        //     CategoryModel.find({}).limit(count).then((datas) => {
        //         resolve(datas)
        //     }).catch((err) => {
        //         reject(err)
        //     })
        // })
    },


    getTopCategoryProduct: async (category_limit, product_limit) => {
        let result = [];




        try {

            let categoryModalOptions = [
                {
                    $lookup: {
                        from: "products",
                        as: "product",
                        foreignField: "category",
                        localField: "_id",
                        pipeline: [
                            {
                                $sort: {
                                    "number_of_orders": -1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        "category_id": "$_id",
                        "category_name": "$name",
                        "products": "$product",

                    }
                }
            ];

            if (category_limit && Number(category_limit) != 0) {
                categoryModalOptions.push({
                    $limit: Number(category_limit)
                })
            }

            if (product_limit && Number(product_limit) != 0) {
                categoryModalOptions[0].$lookup.pipeline.push({
                    $limit: Number(product_limit)
                })
            }

            let categoryData = await CategoryModel.aggregate(categoryModalOptions);


            // let resultCategory = categoryData.map(async (eachCategoryItems) => {
            //     let products = await ProductModel.find({ category: eachCategoryItems?._id })
            //     // .sort({ number_of_orders: -1 })

            //     let storedData = {
            //         category_id: eachCategoryItems?._id,
            //         category_name: eachCategoryItems?.name,
            //         category_product: products
            //     }

            //     console.log(products)

            //     return storedData;
            // })

            return categoryData;
        } catch (e) {
            console.log(e)
            return false;
        }

        resolve(result)

    },


    getCategoryProduct: (category_id) => {
        return new Promise((resolve, reject) => {
            ProductModel.find({ category: new mongoose.Types.ObjectId(category_id) }).then((productItems) => {
                resolve(productItems);
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getAllCoupenCode: () => {
        return new Promise((resolve, reject) => {
            coupenModel.find({}).then((coupens) => {
                resolve(coupens)
            }).catch((err) => {
                reject(err)
            })
        })
    },


    getSingleCoupenCode: (coupen_id) => {
        return new Promise((resolve, reject) => {
            coupenModel.findById(coupen_id).then((coupen) => {
                resolve(coupen)
            }).catch((err) => {
                reject(err);
            })
        })
    },


    addAmountToWallet: async (userid, amount, payment_id, via) => {

        console.log(userid, amount, payment_id, via)
        try {
            let user = await UserModel.findById(userid);
            user.wallet_amount += Number(amount);
            user.total_wallet_credit += Number(amount);
            user.last_wallet_update = new Date();
            await user.save();

            let findWalletHistory = await ModalWallet.findOne({ user_id: new mongoose.Types.ObjectId(userid) });

            if (findWalletHistory) {
                findWalletHistory.wallet_details?.push({
                    date: new Date(),
                    payment_id: payment_id,
                    amount: amount,
                    via: via,
                    withdraw: false
                })
                await findWalletHistory.save()
            } else {
                await new ModalWallet({ user_id: userid, wallet_details: [{ amount, date: new Date(), via: via, payment_id: payment_id, withdraw: false }] }).save();
            }
            return true;

        } catch (e) {
            console.log(e);
            return false;
        }
    },

    withdrawAmountFromWallet: async (userid, amount, payment_id, via) => {

        console.log(userid, amount, payment_id, via)
        try {
            let user = await UserModel.findById(userid);
            user.wallet_amount -= Number(amount);
            user.last_wallet_update = new Date();
            await user.save();

            let findWalletHistory = await ModalWallet.findOne({ user_id: new mongoose.Types.ObjectId(userid) });

            if (findWalletHistory) {
                findWalletHistory.wallet_details?.push({
                    date: new Date(),
                    payment_id: payment_id,
                    amount: amount,
                    via: via,
                    withdraw: true
                })


                await findWalletHistory.save()
            } else {
                await new ModalWallet({ user_id: userid, wallet_details: [{ amount, date: new Date(), via: via, payment_id: payment_id, withdraw: true }] }).save();
            }
            return true;

        } catch (e) {
            console.log(e);
            return false;
        }
    },


    getSingleBanner: (banner_id) => {
        return new Promise((resolve, reject) => {
            BannerModel.findById(banner_id).then((banner) => {
                resolve(banner)
            }).catch((err) => {
                reject(err)
            })
        })
    },

    getAllActiveBanner: () => {
        return new Promise((resolve, reject) => {
            BannerModel.find({ status: true }).then((banners) => {
                resolve(banners);
            }).catch((err) => {
                reject(err)
            })
        })
    },

    getProductPriceByVariation: (product_price, variation) => {

        variation = parseFloat(variation.toString())
        console.log(variation)
        let variationValues = Object.values(PRODUCT_VARIATION);
        let price = product_price;
        console.log(variationValues)
        if (variationValues.includes(variation)) {



            if (variation == PRODUCT_VARIATION["1kg"]) {
                price = product_price;
                console.log(1)
            } else if (variation == PRODUCT_VARIATION["500gm"]) {
                price = product_price / 2;
                console.log(2)
            } else if (variation == PRODUCT_VARIATION["250gm"]) {
                price = product_price / 4;
                console.log(3)
            } else if (variation == PRODUCT_VARIATION["2kg"]) {
                price = product_price * 2;
                console.log(4)
            } else {
                price = product_price;
                console.log(5)
            }
        } else {
            console.log("Not included")
        }
        console.log(price, variation)
        return price
    },


}


module.exports = commonHelper;