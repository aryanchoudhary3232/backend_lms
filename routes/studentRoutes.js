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
router.get('/profile', verify, studentController.studentProfile)
router.get('/dashboard', verify, studentController.getStudentDashboard)
router.put('/update-enrollCourses',verify, studentController.updateEnrollCourses)
router.post('/quiz_submit',verify, studentController.quizSubmission)

router.get('/courses',verify, studentController.getCoursesByStudentId)
// Get student's quiz submissions (aggregated)
router.get('/quiz-submissions', verify, studentController.getQuizSubmissions);

// Streak / activity analytics
router.get('/streak', verify, studentController.getStreakStats);

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

//student progress
router.post('/progress', verify, studentController.studentProgress)
router.get('/get-progress', verify, studentController.getStudentProgress)

// Topic completion
router.post('/mark-topic-complete', verify, studentController.markTopicComplete);
router.get('/topic-completion', verify, studentController.getTopicCompletionStatus);

module.exports = router;
