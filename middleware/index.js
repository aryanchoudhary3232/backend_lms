// Centralized middleware exports
const { verify, verifyAdmin, verifyTeacher } = require("./verify");
const { upload, cloudinary } = require("./upload");
const { errorHandler, notFound } = require("./errorHandler");
const { requestLogger, errorOnlyLogger, performanceMonitor, rateLimitLogger } = require("./logger");
const { validateEnrollment, validateResourceOwnership, verifyStudent } = require("./studentValidation");
const { adminAuditLogger } = require("./adminAuditLogger");

module.exports = {
  // Authentication middlewares
  verify,
  verifyAdmin,
  verifyTeacher,
  verifyStudent,

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

  // Student validation middlewares
  validateEnrollment,
  validateResourceOwnership,

  // Admin audit middleware
  adminAuditLogger,
};
