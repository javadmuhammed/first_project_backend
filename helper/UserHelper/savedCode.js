// updateInvoice: (userid, invoiceId, update_date) => {

//     return new Promise((resolve, reject) => {
//         InvoiceModel.findOne({ invoice_number: invoiceId }).then((invoiceData) => {
//             if (invoiceData) {


//                 InvoiceModel.updateOne({
//                     invoice_number: invoiceId,
//                     userid: userid
//                 }, update_date).then((updated) => {

//                     if ((!invoiceData.order_placed) && update_date.order_placed) {

//                         let ordersData = [];
//                         let productUpdate = [];
//                         invoiceData.products?.forEach(async (products) => {

//                             try {
//                                 let findProduct = await ProductModel.findById(products.product);


//                                 console.log("Stock data", findProduct.stock, products.quantity)
//                                 if (findProduct && (findProduct.stock >= 1 && findProduct.stock >= products.quantity)) {
                                  
//                                     ordersData.push({
//                                         order_id: HelperMethod.createOrderID(),
//                                         order_date: new Date(),
//                                         shipper_name: invoiceData?.address?.name,
//                                         total: products.priceAtPurchase * products.quantity,
//                                         status: const_data.ORDER_STATUS.PENDING,
//                                         address: invoiceData.address,
//                                         user_id: userid,
//                                         invoice_id: invoiceData._id,
//                                         payment_type: update_date.payment_method,
//                                         products: {
//                                             product: products.product,
//                                             quantity: products.quantity
//                                         },
//                                         delivery_time: update_date.delivery_time
//                                     })
//                                     productUpdate.push({
//                                         updateOne: {
//                                             filter: { _id: products.product },
//                                             update: {
//                                                 $inc: {
//                                                     stock: -products.quantity
//                                                 }
//                                             }
//                                         }
//                                     })
//                                 }

//                                 console.log("Order Data ", ordersData)
//                             } catch (e) {
//                                 console.log("Error found")
//                                 console.log(e);
//                             }
//                         })


//                         console.log(ordersData.length)
//                         if (ordersData.length > 0) {
//                             OrdersModalDb.insertMany(ordersData).then(async (dt) => {

//                                 try {
//                                     await CartModel.deleteMany({ user_id: new mongoose.Types.ObjectId(userid) })
//                                     await ProductModel.bulkWrite(productUpdate)

//                                 } catch (e) {
//                                     resolve("Product orderd success");
//                                 }
//                                 finally {
//                                     resolve("Product orderd success");
//                                 }
//                             }).catch((err) => {
//                                 console.log(err)
//                                 reject("Product order failed")
//                             })
//                         } else {
//                             console.log("No Product found worked")
//                             reject("No product available")
//                         }

//                     } else {
//                         console.log("Invoice update failed")
//                         resolve("Invoice updated")
//                     }

//                 }).catch((err) => {
//                     console.log(err)
//                     reject("Invoice updation failed")
//                 })
//             }
//         })

//     })
// },