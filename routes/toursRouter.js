const express = require("express");

const toursController = require("../controller/toursController");
const authController = require("./../controller/authController");
const reviewcontroller = require("../controller/reviewcontroller");
const reviewrouter = require("./reviewRouter");

const router = express.Router();
// get  tours/03333/reviews
// post  tours/03333/reviews
//  get  tours/03333/reviews/4343443

router.use("/:tourId/coursereview", reviewrouter);

router.route("/tour-stats").get(toursController.Tourstats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    toursController.monthlyplan
  );
//router.param('id',toursController.checkId)
router
  .route("/top-cheap")
  .get(toursController.aliasTopTour, toursController.GetAllTours);

//get nearst one by distance
router.route("/distances/:latlng/unit/:unit").get(toursController.getDistances);
// get tour with radius
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(toursController.getToursWithin);

router
  .route("/")
  .get(authController.protect, toursController.GetAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    toursController.CreateTour
  );

router
  .route("/:id")
  .get(toursController.GetTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.UpdateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    toursController.DeleteTour
  );

// get  tours/03333/reviews
// post  tours/03333/reviews
//  get  tours/03333/reviews/4343443
//router.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewcontroller.createreview)

module.exports = router;
