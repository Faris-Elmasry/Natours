const Tour = require("../model/Toursmodel");
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
        "connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com"
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
  res
    .status(200)

    .render("login", {
      title: "User Login",
    });
});

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

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
