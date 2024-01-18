const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../Models/userSchema");

// Middleware to authenticate  user based on => JWT token
exports.authUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  // Verify the token and assign user information to => req.user
  req.user = await User.findById(jwt.verify(token, process.env.JWT_SECRET).id);

  next();
});

exports.isManager = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,403
        )
      );
    }
    next();
  };
};
