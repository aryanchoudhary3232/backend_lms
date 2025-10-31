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

router.get('/courses',verify, studentController.getCoursesByStudentId)
// Get student's quiz submissions (aggregated)
router.get('/quiz-submissions', verify, studentController.getQuizSubmissions);

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
