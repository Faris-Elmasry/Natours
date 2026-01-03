const Tour = require("../model/Toursmodel");
const User = require("../model/Usermodel");
const Booking = require("../model/bookingModel");
const Review = require("../model/Reviewmodel");
const catchAsync = require("../utilties/catchAsync");
const AppError = require("./../utilties/appError");

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTours = (req, res) => {
  res.status(200).render("tour", {
    title: "The Forest Hiker Tour",
  });
};
exports.getTour = catchAsync(async (req, res, next) => {
  try {
    let tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: "reviews",
      fields: "reviws rating user",
    });
    if (!tour) {
      return next(new AppError("not found", 404));
    }
    res
      .status(200)
      .set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' https://unpkg.com https://api.mapbox.com blob:; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com https://api.mapbox.com; connect-src 'self' http://localhost:3000 http://127.0.0.1:3000 https://unpkg.com https://tile.openstreetmap.org https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com https://accept.paymob.com ws://localhost:*; img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tiles.mapbox.com https://api.mapbox.com; font-src 'self' https://fonts.gstatic.com; worker-src 'self' blob:; child-src 'self' blob:"
      )
      .render("tour", {
        title: `${tour.name} Tour`,
        tour,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

exports.getloginform = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
});

exports.getSignupForm = catchAsync(async (req, res, next) => {
  res.status(200).render("signup", {
    title: "Create your account",
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const myTours = await Tour.find({ _id: { $in: tourIDs } });

  // 3) Find reviews
  const myReviews = await Review.find({ user: req.user.id }).populate({
    path: "tour",
    select: "name imageCover",
  });

  res.status(200).render("account", {
    title: "Your account",
    myTours,
    myReviews,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  console.log("update user dataaa");
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser,
  });
});

exports.getPaymentSuccess = catchAsync(async (req, res) => {
  // Paymob sends all transaction data as query parameters
  const { success, error_occured, order, id } = req.query;

  console.log("💳 Payment callback received:", {
    success,
    error_occured,
    orderId: order,
    transactionId: id,
  });

  // Check if payment was successful
  if (success === "true" && error_occured === "false") {
    return res.status(200).render("paymentSuccess", {
      title: "Payment Successful",
    });
  }

  // Payment failed or error occurred
  res.status(200).render("paymentError", {
    title: "Payment Failed",
  });
});

exports.getPaymentError = (req, res) => {
  // Fallback error page
  console.log("❌ Payment error page accessed:", req.query);

  res.status(200).render("paymentError", {
    title: "Payment Failed",
  });
};

exports.getCreateTourForm = catchAsync(async (req, res, next) => {
  res.status(200).render("editTour", {
    title: "Create New Tour",
  });
});

exports.getEditTourForm = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) return next(new AppError('No tour found with that ID', 404));

  res.status(200).render("editTour", {
    title: `Edit ${tour.name}`,
    tour,
  });
});

exports.getCreateUserForm = catchAsync(async (req, res, next) => {
  res.status(200).render("editUser", {
    title: "Create New User",
  });
});

exports.getEditUserForm = catchAsync(async (req, res, next) => {
  const userToEdit = await User.findById(req.params.id);
  if (!userToEdit) return next(new AppError('No user found with that ID', 404));

  res.status(200).render("editUser", {
    title: `Edit ${userToEdit.name}`,
    userToEdit,
  });
});
