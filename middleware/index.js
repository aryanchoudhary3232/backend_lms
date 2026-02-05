// Centralized middleware exports
const { verify, verifyAdmin, verifyTeacher } = require("./verify");
const { upload, cloudinary } = require("./upload");
const { errorHandler, notFound } = require("./errorHandler");
const { requestLogger, errorOnlyLogger, performanceMonitor, rateLimitLogger } = require("./logger");

module.exports = {
  // Authentication middlewares
  verify,
  verifyAdmin,
  verifyTeacher,
  
  // File upload middleware
  upload,
  cloudinary,
  
  // Error handling middlewares
  errorHandler,
  notFound,
  
  // Logging middlewares
  requestLogger,
  errorOnlyLogger,
  performanceMonitor,
  rateLimitLogger,
};
