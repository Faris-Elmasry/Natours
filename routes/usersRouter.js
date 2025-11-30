const express = require("express");

const usersController = require("../controller/usersController");
const authController = require("../controller/authController");

const router = express.Router();
router.get("/logout", authController.logout);

router.post("/signup", authController.Signup);
router.post("/login", authController.login);
//protec all routes after this
router.use(authController.protect);
router.post("/forgetPassword", authController.forgetPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch("/updatePassword", authController.updatepassword);

/*

router.patch(
  '/updateMe',

  userController.updateMe
);


*/

router.patch(
  "/updateMe",
  usersController.uploadUserPhoto,
  usersController.resizeUserPhoto,
  usersController.updateMe
);
router.get("/getme", usersController.getme, usersController.GetUser);
router.delete("/deleteMe", usersController.deleteMe);

//protec all routes after this  restrict ot the admin
router.use(authController.restrictTo("admin"));
router
  .route("/")
  .get(usersController.GetAllUsers)
  .post(usersController.CreateUser);

router
  .route("/:id")
  .get(usersController.GetUser)
  .patch(usersController.UpdateUser)
  .delete(usersController.DeleteUser);

module.exports = router;
