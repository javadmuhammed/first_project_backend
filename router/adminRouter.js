

const express = require("express");
// const adminController = require("../controller/adminController");
// const commonController = require("../controller/CommonController");
const authMiddleWare = require("../middlewares/AuthMiddleWare");
const { adminLoginPost, forgetPassword, resetPassword, validateJwt, regerarate_jwt } = require("../controller/adminController/AuthController");
const { getAllProduct, getSingleProduct, getOutofStockItems, addProduct, updateProduct, updateManyProduct, safeDeleteProduct, outOfStockProducts, soonOutOfStockProducts, updateStock } = require("../controller/adminController/ProductController");
const { getOrderList, getSingleOrder, updateOrder, getOrderbyProductID, getUserOrder } = require("../controller/adminController/OrdersController");
const { getAllImages, uploadImage, delete_image } = require("../controller/adminController/ImageController");
const { downloadInvoice } = require("../controller/adminController/InvoiceController");
const { getAllUsers, addUser, updateUser, deleteUser, getSingleUser } = require("../controller/adminController/UserController");
const { getAllCategory, getCategoryProduct, getSingleCategory, addCategory, deleteCategory, updateCategory } = require("../controller/adminController/CategoryController");
const { getBanner, addBanner, deleteBanner, editBanner, getSingleBanner } = require("../controller/adminController/BannerController");
const { generateSalesReport, generateSalesReportAsPdf } = require("../controller/adminController/ReportController");
const { siteStatic, updateBasicSiteSettings, getSiteBasicSettings } = require("../controller/adminController/SiteRelated");
const { getSingleVendor } = require("../controller/adminController/VendorRelated");
const { addCoupenCode, getAllCoupenCode, deleteCoupenCode, editCoupenCode, getSingleCoupen } = require("../controller/adminController/CoupenRelated");
const router = express.Router();



// Site Related
router.get("/site_statics",  siteStatic);
router.get("/get_site_settings", authMiddleWare.isValidAdmin, getSiteBasicSettings);
router.post("/update_site_settings", authMiddleWare.isValidAdmin, updateBasicSiteSettings);

//Auth Related
router.post("/login", adminLoginPost);
router.post("/forget_password", forgetPassword);
router.post("/reset_password", resetPassword);
router.post("/validate_jwt", validateJwt);
router.post("/regenarate_jwt", regerarate_jwt);

// Profile & Account Related
router.put("/edit_account", authMiddleWare.isValidAdmin,)

//Product Related
router.get("/get_all_product", authMiddleWare.isValidAdmin, getAllProduct)
router.get("/get_single_product/:product_id", authMiddleWare.isValidAdmin, getSingleProduct)
router.get("/outofstock_items", authMiddleWare.isValidAdmin, getOutofStockItems)
router.post("/add_product", authMiddleWare.isValidAdmin, addProduct)
router.patch("/update_product", authMiddleWare.isValidAdmin, updateProduct)
router.patch("/update_many_product", authMiddleWare.isValidAdmin, updateManyProduct)
router.patch("/delete_product", authMiddleWare.isValidAdmin, safeDeleteProduct)

//Stock related
router.get('/out_of_stock_products', authMiddleWare.isValidAdmin, outOfStockProducts)
router.get('/soon_outofstock', authMiddleWare.isValidAdmin, soonOutOfStockProducts)
router.patch('/update_stock', authMiddleWare.isValidAdmin, updateStock)

//Order Related
router.get('/get_all_order', authMiddleWare.isValidAdmin, getOrderList)
router.get('/get_single_order/:order_id', authMiddleWare.isValidAdmin, getSingleOrder)
router.patch('/update_order', authMiddleWare.isValidAdmin, updateOrder)
router.get('/get_orders_product_id/:product_id', getOrderbyProductID)
router.get('/get_user_order/:user_id', getUserOrder)

//Image Related
router.get('/get_all_images', authMiddleWare.isValidAdmin, getAllImages)
router.post('/upload_image', authMiddleWare.isValidAdmin, uploadImage)
router.post('/delete_image', authMiddleWare.isValidAdmin, delete_image)

//Invoice Related
router.post('/download_invoice', authMiddleWare.isValidAdmin, downloadInvoice)

// User Related
router.get('/get_all_users', authMiddleWare.isValidAdmin, getAllUsers)
router.post('/add_user', authMiddleWare.isValidAdmin, addUser)
router.patch('/update_user', authMiddleWare.isValidAdmin, updateUser)
router.get('/get_single_user/:user_id', authMiddleWare.isValidAdmin, getSingleUser)
router.patch('/delete_user', authMiddleWare.isValidAdmin, deleteUser)


// Category Related
router.get('/get_all_category', authMiddleWare.isValidAdmin, getAllCategory)
router.get('/get_category_product/:category_id', authMiddleWare.isValidAdmin, getCategoryProduct)
router.get('/get_single_category/:category_id', authMiddleWare.isValidAdmin, getSingleCategory)
router.post('/add_category', authMiddleWare.isValidAdmin, addCategory)
router.post('/delete_category', authMiddleWare.isValidAdmin, deleteCategory)
router.patch('/update_category', authMiddleWare.isValidAdmin, updateCategory)

// Banner Managament
router.get("/get_banners", authMiddleWare.isValidAdmin, getBanner)
router.get("/get_single_banner/:banner_id", authMiddleWare.isValidAdmin, getSingleBanner)
router.post("/add_banner", authMiddleWare.isValidAdmin, addBanner)
router.post("/delete_banner", authMiddleWare.isValidAdmin, deleteBanner)
router.put("/edit_banner", authMiddleWare.isValidAdmin, editBanner)

// Sales Report
router.post("/generate_sales_report", authMiddleWare.isValidAdmin, generateSalesReport);
router.post("/generate_sales_report_pdf", authMiddleWare.isValidAdmin, generateSalesReportAsPdf);

// Vendor Related
router.get("/get_single_vendor", authMiddleWare.isValidAdmin, getSingleVendor)

// Coupen Related
router.get("/get_all_coupen_code", authMiddleWare.isValidAdmin,getAllCoupenCode)
router.get("/get_single_coupen/:coupen_id", authMiddleWare.isValidAdmin,getSingleCoupen)
router.post("/add_coupen_code", authMiddleWare.isValidAdmin,addCoupenCode)
router.put("/edit_coupen_code", authMiddleWare.isValidAdmin,editCoupenCode)
router.post("/delete_coupen_code", authMiddleWare.isValidAdmin,deleteCoupenCode)


module.exports = router;