const User = require("../Models/userSchema");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../Middlewares/catchAsyncErrors");
const deliverToken = require("../utils/deliverToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto')
const cloudinary = require('cloudinary')

// register a user => /api/v1/register
// register a user => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale'
    });

    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url
      },
    });

    deliverToken(user, 200, res);
  } catch (error) {
    console.error("Registration error:", error); 
    return next(new ErrorHandler(`Registration failed, Something went wrong : ${error.message || "Unknown error"}`, 500));
  }
});

//login user /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter Email and password", 400))
  }

  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401))
  }

  const isPasswordMatched = await user.comparePassword(password)
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401))
  }

  deliverToken(user, 200, res)

});

// Forget Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  //get ResetPassword Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  //reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  const message = `Your password reset token is :- \n\n ${resetUrl} \n\nIf you have not requested email then, please ignore it`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Epicgear Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});


//RESET NEW PASSWORD api/v/password/reset/:token


exports.resetNewPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  deliverToken(user, 200, res);
});



exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success:true,
    user
  })
});

//Update User Password

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isMatched = await user.comparePassword(req.body.oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  user.password = req.body.password;
  await user.save();

  deliverToken(user, 200, res);
});

// Update userProfile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  // Extracting data from req.body
  const newUserData = {
    name: req.body.name,
    email: req.body.email
  };

  //Update AVATAR
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new:true,
    runValidators: true,
    useFindAndModify: false
  })
  res.status(200).json({
    success: true,
  });
});

//Logout user = > /api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });


  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});


// @ADMIN ROUTES  -- Admin 
// GET ALL USERS /gapi/v1/admin/users 
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    countUsers:users.length,
    users,
  });
});


//Get single user -- Admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//Delete User -- Admin

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});