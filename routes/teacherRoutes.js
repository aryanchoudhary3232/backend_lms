const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

const teacherController = require("../controller/teacherController");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let resourceType = "image";
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    }

    return {
      folder: `${path.join(__dirname)}uploads`,
      resource_type: resourceType,
    };
  },
});

const upload = multer({ storage });

// teacher courses
router.post(
  "/courses/create_course",
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
