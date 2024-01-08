
const express = require("express");
const router = express.Router();
// const userController = require("../controller/userController")
const authMiddleWare = require("../middlewares/AuthMiddleWare");
const authController = require("../controller/userController/AuthController");
const productController = require("../controller/userController/ProductController");
const profileController = require("../controller/userController/ProfileController");
const orderController = require("../controller/userController/OrdersController");
const wishlistController = require("../controller/userController/WishlistController");
const addressController = require("../controller/userController/AddressController");
const cartController = require("../controller/userController/CartController");
const invoiceController = require("../controller/userController/InvoiceController");
const placeOrderController = require("../controller/userController/PlaceOrderController");
const catgeoryController = require("../controller/userController/CategoryController");
const { getAllCoupenCode } = require("../controller/userController/CoupenCodeController");
const coupenController = require("../controller/userController/CoupenCodeController");
const WalletRelated = require("../controller/userController/WalletRelated");
const bannerController = require("../controller/userController/BannerController");

// const commonController = require("../controller/CommonController");


//Auth Related
router.get("/token_validation:token", authController.tokenValidation)
router.post("/sign_up", authController.userSignUpPost)
router.post("/otp_validation", authController.otpValidation)
router.post("/login", authController.userLoginPost)
router.post("/forget_password", authController.forgetPassword)
router.post("/new_password", authController.resetPassword)
router.post("/validate_jwt", authController.validateJWT)
router.post("/re_generate_token", authController.reGenerateJWT)
router.get("/get_user_by_jwt/:jwt_token", authController.getUserByJwt)

//Product Related
router.get("/get_all_product", productController.getAllProduct)
router.get("/get_single_product/:product_id", productController.getSingleProduct);
router.get("/get_product_option/:option/:limit", productController.getProductOption);
router.get("/filter_product", productController.filterProduct);

//Wallet Related
router.get("/user_wallet", authMiddleWare.isValidUser, WalletRelated.getWalletHistory)
router.post("/create_wallet_order", authMiddleWare.isValidUser, WalletRelated.createWalletOrder)
router.post("/verify_wallet_order", authMiddleWare.isValidUser, WalletRelated.verifyWalletOrder)

//Orders Related    
router.get("/get_orders", authMiddleWare.isValidUser, orderController.getOrders)
router.get("/get_orders_pagination/:page_number/:limit", authMiddleWare.isValidUser, orderController.getOrdersPagination)
router.get("/get_single_order/:order_id", authMiddleWare.isValidUser, orderController.getSingleOrder)
router.get("/get_order_by_number/:order_number", orderController.getSingleOrderByNumber);
router.patch("/cancel_order", authMiddleWare.isValidUser, orderController.cancelOrder)
router.post("/product_return_request", authMiddleWare.isValidUser, orderController.productReturnRequest);

//Profile Related
router.put("/update_profile", authMiddleWare.isValidUser, profileController.profileRelated)
router.post("/update_phone_number", authMiddleWare.isValidUser, profileController.updatePhoneNumberRequest)
router.post("/phone_number_update_otp", authMiddleWare.isValidUser, profileController.phonNumberUpdateOtpConfirmation)
router.put('/update_profile_image', authMiddleWare.isValidUser, profileController.profileImageUpdate);
router.put("/update_password", authMiddleWare.isValidUser, profileController.updateUserPassword)
router.post("/update_email_address", authMiddleWare.isValidUser, profileController.updateEmailAddress)
router.get("/update_email_token/:token", profileController.updateEmailAddressToken)

//Wishlist related
router.get("/get_wishlist", authMiddleWare.isValidUser, wishlistController.getWishlistItems)
router.post("/add_wishlist", authMiddleWare.isValidUser, wishlistController.addToWishlist)
router.delete("/delete_wishlist/:product_id", authMiddleWare.isValidUser, wishlistController.deleteWishlist)

//address related
router.get('/get_addresses', authMiddleWare.isValidUser, addressController.getAddressList);
router.get('/get_single_address/:address_id', authMiddleWare.isValidUser, addressController.getSingleAddress);
router.post('/add_addresses', authMiddleWare.isValidUser, addressController.addAddress);
router.put('/edit_addresses', authMiddleWare.isValidUser, addressController.editAddress);
router.put('/set_address_primary', authMiddleWare.isValidUser, addressController.setAddressPrimary);
router.put('/add_new_address_type', authMiddleWare.isValidUser, addressController.addNewAddressType);
router.delete('/delete_address/:address_id', authMiddleWare.isValidUser, addressController.deleteAddress);

//Cart Related  
router.get("/cart_pricelist", authMiddleWare.isValidUser, cartController.getCartPriceList)
router.get("/get_cart_items",  authMiddleWare.isValidUser, cartController.getCartItems)
router.post("/add_to_cart", authMiddleWare.isValidUser, cartController.addToCart)
router.patch("/cart_quanity_update", authMiddleWare.isValidUser, cartController.updateCartQuanity)
router.patch("/cart_variation_update", authMiddleWare.isValidUser, cartController.updateCartVariation)
router.delete("/clear_cart_items", authMiddleWare.isValidUser, cartController.clearCartItems)
router.delete("/remove_cart_item/:cart_id/:product_id", authMiddleWare.isValidUser, cartController.deletCartItem)

//Checkout related
router.post("/place_invoice", authMiddleWare.isValidUser, invoiceController.placeInvoice)
router.post("/place_order", authMiddleWare.isValidUser, placeOrderController.placeOrder) //cleared
router.post("/razorpay_order", authMiddleWare.isValidUser, placeOrderController.razorpayOrder)
router.post("/verify_razorpay", authMiddleWare.isValidUser, placeOrderController.verifyRazorpay)

//invoice Related
router.get("/get_single_invoice/:invoice_id", authMiddleWare.isValidUser, invoiceController.getSingleInvoice)
router.post("/create_invoice", authMiddleWare.isValidUser, invoiceController.createInvoice)
router.patch("/invoice_phone_verification", authMiddleWare.isValidUser, invoiceController.invoicePhoneVerification)
router.patch("/invoice_update", authMiddleWare.isValidUser, invoiceController.updateInvoice)
router.patch("/resend_checkout_otp", authMiddleWare.isValidUser, invoiceController.resendOtpCode)
router.post("/download_invoice", authMiddleWare.isValidUser, invoiceController.downloadInvoice)
router.post("/update_invoice_phone", authMiddleWare.isValidUser, invoiceController.updateInvoicePhone);
router.post("/update_order_invoice", authMiddleWare.isValidUser, invoiceController.updateOrderInvoice);

// Category Related 
router.get('/get_all_category', catgeoryController.getAllCategory)
router.get("/get_category_minimize/:limit?/:skip?", catgeoryController.getCategoryMinimize)
router.get('/get_category_product/:category_id', catgeoryController.getCategoryProduct);
router.get('/get_top_category_product/:category_limit?/:product_limit?', catgeoryController.getTopCategoryProduct);

// Coupen Related
router.get("/get_all_coupencode", coupenController.getAllCoupenCode);
router.post("/apply_coupen/:coupen_code/:invoice_id", authMiddleWare.isValidUser, coupenController.applayCoupenCode)

// Banner Related
router.get("/get_banners", bannerController.getAllBanners);



module.exports = router;