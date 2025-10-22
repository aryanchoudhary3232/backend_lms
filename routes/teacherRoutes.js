const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

const teacherController = require("../controller/teacherController");
const { verify } = require("../middleware/verify");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // choose resource type based on mimetype; allow pdf as raw
    let resourceType = "image";
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    } else if (file.mimetype === "application/pdf") {
      resourceType = "raw"; // store PDFs as raw in cloudinary
    }

    return {
      folder: `uploads`,
      resource_type: resourceType,
    };
  },
});

const upload = multer({ storage });

// teacher courses
router.post(
  "/courses/create_course",
  verify,
  upload.any(),
  teacherController.createCourse
);
router.get("/courses/get_courses", teacherController.getCourses);
router.get(
  "/courses/get_course_by_id/:courseId",
  teacherController.getcourseById
);

//teacher
router.get("/", teacherController.getTeachers);

module.exports = router;
