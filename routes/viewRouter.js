const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

const viewcontroller = require("../controller/viewcontroller");

router.use(authController.isLoggedIn);
router.get("/login", authController.isLoggedIn, viewcontroller.getloginform);
router.get("/signup", authController.isLoggedIn, viewcontroller.getSignupForm);

router.get("/", authController.isLoggedIn, viewcontroller.getOverview);
router.get("/tour", viewcontroller.getTours);

router.get("/tour/:slug", authController.isLoggedIn, viewcontroller.getTour);
router.get("/me", authController.protect, viewcontroller.getAccount);

router.get("/my-tours", authController.protect, viewcontroller.getMyTours);

// Payment callback routes
router.get("/payment-success", viewcontroller.getPaymentSuccess);
router.get("/payment-error", viewcontroller.getPaymentError);

module.exports = router;
