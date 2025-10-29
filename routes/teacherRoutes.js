const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

const teacherController = require("../controller/teacherController");
const { verify, verifyTeacher } = require("../middleware/verify");

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

// NEW: teacher qualification verification
router.post(
  "/verification/upload",
  verify,
  verifyTeacher,
  upload.single("qualification"),
  teacherController.uploadQualification
);

router.get(
  "/verification/status",
  verify,
  verifyTeacher,
  teacherController.getQualificationStatus
);

router.get("/courses/get_courses", teacherController.getCourses);
router.get(
  "/courses/get_course_by_id/:courseId",
  teacherController.getcourseById
);

//teacher
router.get("/", teacherController.getTeachers);

//routes for dashboard metrics
router.get("/metrics", verify, teacherController.getTeacherMetrics);

module.exports = router;
