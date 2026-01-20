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

// Student management (admin use)
router.get("/", studentController.getStudents);

// Student profile and dashboard (requires auth)
router.get('/profile', verify, studentController.studentProfile);
router.get('/dashboard', verify, studentController.getStudentDashboard);

// Enrollment management
router.put('/update-enrollCourses', verify, studentController.updateEnrollCourses);
router.get("/enrolled-courses", verify, studentController.getEnrolledCourses);
router.post("/courses/:courseId/enroll", verify, studentController.enrollInCourse);

// Course browsing (public - for course catalog)
router.get("/browse-courses", studentController.getAllCourses);
router.get("/courses/:courseId", studentController.getCourseById);

// My courses (authenticated - courses student is enrolled in)
router.get('/my-courses', verify, studentController.getCoursesByStudentId);

// Quiz routes
router.post('/quiz_submit', verify, studentController.quizSubmission);
router.get('/quiz-submissions', verify, studentController.getQuizSubmissions);

// Streak / activity analytics
router.get('/streak', verify, studentController.getStreakStats);

// Student progress tracking
router.post('/progress', verify, studentController.studentProgress);
router.get('/get-progress', verify, studentController.getStudentProgress);

// Topic completion
router.post('/mark-topic-complete', verify, studentController.markTopicComplete);
router.get('/topic-completion', verify, studentController.getTopicCompletionStatus);

module.exports = router;
