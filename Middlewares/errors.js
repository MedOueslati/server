const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  // If the error is an instance of ErrorHandler, use its status code and message
  if (err instanceof ErrorHandler) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  } else {
    // For other types of errors, set a default 500 status code
    err.statusCode = 500;
    res.status(err.statusCode).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
};
