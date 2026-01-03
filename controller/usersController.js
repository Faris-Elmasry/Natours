const AppError = require("../utilties/appError");
const User = require("./../model/Usermodel");
const catchAsync = require("./../utilties/catchAsync");
const factory = require("./handelerFactory");
const multer = require("multer");
const sharp = require("sharp");




// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`starter/public/img/users/${req.file.filename}`);

  next();
});

const filterobj = (obj, ...allowedfields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedfields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getme = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //1)create error if user posts password data
  if (req.body.confpassword || req.body.password) {
    next(
      new AppError(
        "this route not for update password .please use /updatePassword"
      )
    );
  }
  //2)filterd out unwanted fields name that are not allowed to be updated
  const filteredBody = filterobj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;
  //3)Update user documents
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "succses",
    data: { user: updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id, { active: false });

  res.status(204).json({
    status: "succses",
    data: null,
  });
});

exports.CreateUser = factory.createone(User);

exports.GetUser = factory.getone(User);
exports.GetAllUsers = factory.getall(User);

exports.DeleteUser = factory.deleteone(User);
//donot update password with this
exports.UpdateUser = factory.updateone(User);
