const express = require("express");
const router = express.Router();
const {upload} = require('../utils/multer')
const teacherController = require("../controller/teacherController");
const { verify, verifyTeacher } = require("../middleware/verify");

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
