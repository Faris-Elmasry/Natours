const express = require('express');
const reviewcontroller= require("../controller/reviewcontroller")
const authController= require("../controller/authController")

const router = express.Router({mergeParams:true});




router.use(authController.protect)

router
  .route('/') 
  .get(reviewcontroller.getallreview)
  .post(authController.restrictTo('user'),reviewcontroller.SetUserTourids,reviewcontroller.createreview)


  router
  .route('/:id')
  .get(reviewcontroller.Getreview)
  .patch(authController.restrictTo('user','admin'),reviewcontroller.Updatereview)
  .delete(authController.restrictTo('user','admin'),reviewcontroller.Deletereview)


module.exports = router;