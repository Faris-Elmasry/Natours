const express = require("express");
const passport = require("passport");
const authController = require("../controller/authController");

const router = express.Router();

// @route   GET /auth/google
// @desc    Redirect to Google for authentication
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// @route   GET /auth/google/callback
// @desc    Google callback after authentication
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  authController.googleAuthCallback
);

module.exports = router;
