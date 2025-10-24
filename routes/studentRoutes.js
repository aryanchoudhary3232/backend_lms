const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentController");
const { verify } = require("../middleware/verify");

// Test route
router.get("/test", (req, res) => {
  res.json({
    message: "Student routes working!",
    timestamp: new Date().toISOString(),
  });
});

// Student profile
router.get("/", studentController.getStudents);
router.post('/quiz_submit',verify, studentController.quizSubmission)

// Course-related routes for students
router.get("/courses", studentController.getAllCourses);
router.get("/courses/:courseId", studentController.getCourseById);

// Enrollment routes
router.post(
  "/courses/:courseId/enroll",
  verify,
  studentController.enrollInCourse
);
router.get("/enrolled-courses", verify, studentController.getEnrolledCourses);

module.exports = router;
