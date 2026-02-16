const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { multerFileFilter, UPLOAD_LIMITS } = require("./fileUploadValidator");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ── Cloudinary storage (direct upload — used for simple routes) ──
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let resourceType = "image";
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    } else if (file.mimetype === "application/pdf") {
      resourceType = "raw";
    }

    return {
      folder: `uploads`,
      resource_type: resourceType,
    };
  },
});

const upload = multer({
  storage,
  fileFilter: multerFileFilter,
  limits: UPLOAD_LIMITS,
});

// ── Memory storage (fast parse — validate first, upload later) ──
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFileFilter,
  limits: UPLOAD_LIMITS,
});

/**
 * Middleware: uploads files from req.files (memory buffers) to Cloudinary.
 * Replaces each file's `buffer` with the Cloudinary `path` (secure_url)
 * so downstream code (controller) works unchanged.
 */
function uploadToCloudinary(req, res, next) {
  if (!req.files || req.files.length === 0) return next();

  const uploads = req.files.map(
    (file) =>
      new Promise((resolve, reject) => {
        let resourceType = "image";
        if (file.mimetype.startsWith("video")) {
          resourceType = "video";
        } else if (file.mimetype === "application/pdf") {
          resourceType = "raw";
        }

        const stream = cloudinary.uploader.upload_stream(
          { folder: "uploads", resource_type: resourceType },
          (err, result) => {
            if (err) return reject(err);
            // Mimic CloudinaryStorage output so controllers stay compatible
            file.path = result.secure_url;
            file.filename = result.public_id;
            file.cloudinary = result;
            delete file.buffer; // free memory
            resolve();
          },
        );
        stream.end(file.buffer);
      }),
  );

  Promise.all(uploads)
    .then(() => next())
    .catch((err) => {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({
        success: false,
        message: "File upload to cloud storage failed",
      });
    });
}

module.exports = { upload, memoryUpload, uploadToCloudinary, cloudinary };
