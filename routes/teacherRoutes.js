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

router.post(
  "/create_course",
  upload.fields([{ name: "image" }, { name: "video" }]),
  teacherController.createCourse
);
router.get("/get_courses", teacherController.getCourses);
router.get("/get_course_by_id/:courseId", teacherController.getcourseById);

module.exports = router;
