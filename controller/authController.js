const crypto = require("crypto");
const User = require("./../model/Usermodel");
const { promisify } = require("util");
const catchAsync = require("./../utilties/catchAsync");
const AppError = require("./../utilties/appError");
const Email = require("./../utilties/email");
const jwt = require("jsonwebtoken");

const signtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

const CreateandSendToken = (user, statuscode, res) => {
  const token = signtoken(user._id);
  const constCookies = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") constCookies.secure = true;
  res.cookie("jwt", token, constCookies);
  // console.log(token)
  //remove pass from output
  user.password = undefined;
  res.status(statuscode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

exports.Signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confpassword: req.body.confpassword,
    passwordChagedAt: req.body.passwordChagedAt,
    role: req.body.role,
  });

  //127.0.0.1://3000  {{URL}}api/v1/users/updateMe
  const url = `${req.protocol}://${req.get("host")}/me`;
  console.log(url);

  await new Email(newUser, url).sendWelcome();
  CreateandSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1)check the email and password is exist
  if (!email || !password) {
    return next(new AppError("email or password is not exist", 404));
  }

  // 2)user and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("email or password is not correct", 401));
  }
  // 3)check everything is ok
  CreateandSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is array ["admin" ,"lead-guide"]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you dont have a permmision to this action", 403)
      );
    }

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user with this email", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user email
  // Data comes from req
  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.log(err);
    user.PasswordresetToken = undefined;
    user.PasswordresetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        `There was an error in sending the email . Please try again later`,
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on token
  //encrybt the the token and compare it with the encrypted one in db
  //req.parms.token will hash this token given in url of reset token
  // console.log(req.params.token);
  const hasedtoken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // console.log(hasedtoken);

  const user = await User.findOne({
    PasswordresetToken: hasedtoken,
    PasswordresetExpire: { $gte: Date.now() },
  });

  //2)if token not expired and if there is user ,set new pass
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.confpassword = req.body.confpassword;
  user.PasswordresetToken = undefined;
  user.PasswordresetExpire = undefined;
  //after modify qe should save
  await user.save();
  //3)update changepasswordat prperty for user

  //4)log the user in send jwt
  CreateandSendToken(user, 200, res);
});

exports.updatepassword = catchAsync(async (req, res, next) => {
  //1) get user

  let user = await User.findById(req.user.id).select("+password");

  //2) check if password is correct
  if (!(await user.correctPassword(req.body.CurrentPassword, user.password))) {
    return next(new AppError(" password is not correct", 401));
  }
  //3) if true update password
  user.password = req.body.password;
  user.confpassword = req.body.confpassword;
  await user.save(); // to save it and make validation

  //4) log user in send JWT
  CreateandSendToken(user, 200, res);
});

// Google OAuth Callback
exports.googleAuthCallback = catchAsync(async (req, res, next) => {
  // User is authenticated via Passport, create JWT token and set cookie
  const token = signtoken(req.user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Redirect to account page
  res.redirect("/me");
});
