const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Userschema = new mongoose.Schema({
  name: {
    type: String,
    requireed: [true, "please enter your email"],
  },
  email: {
    type: String,
    unique: true,
    requireed: [true, "please enter your   email"],
    validate: [validator.isEmail, "please enter your   email"],
  },
  photo: { type: String, default: "default.jpg" },

  role: {
    type: String,
    enum: ["user", "admin", "guide", "lead-guide"],
    default: "user",
  },
  password: {
    type: String,
    requireed: [true, "please enter your  password"],
    minlength: 10,
    select: false,
  },
  confpassword: {
    type: String,
    requireed: [true, " please  confirm pass"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "passwords are not the same",
    },
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    //    requireed:[true,"the changeed passeord must have a date   "]
  },
  PasswordresetToken: String,
  PasswordresetExpire: String,
  active: {
    default: true,
    type: Boolean,
    select: false,
  },
});

Userschema.pre("save", async function (next) {
  // retrun next if pass not modify
  if (!this.isModified("password")) return next();
  //hash if it modify
  this.password = await bcrypt.hash(this.password, 12);
  //delete the confirm pass
  this.confpassword = undefined;
});

Userschema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

Userschema.pre(/^find/, async function (next) {
  // this point ro current query
  this.find({ active: { $ne: false } });
});

Userschema.methods.correctPassword = async function (
  canditatePassword,
  userPssword
) {
  console.log(bcrypt.compare(canditatePassword, userPssword));
  console.log(bcrypt.compare(userPssword, canditatePassword));
  return await bcrypt.compare(canditatePassword, userPssword);
};

Userschema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

Userschema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.PasswordresetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.PasswordresetExpire = Date.now() + 10 * 60 * 1000; //10min in mili secondes
  console.log(this.PasswordresetToken, resetToken);
  return resetToken;
};

const User = mongoose.model("User", Userschema);

module.exports = User;
