const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentController");
const { verify, validateEnrollment, validateResourceOwnership, verifyStudent } = require("../middleware");

// Test route
router.get("/test", (req, res) => {
  res.json({
    message: "Student routes working!",
    timestamp: new Date().toISOString(),
  });
});

// Student profile (uses validateResourceOwnership to ensure students access their own data)
router.get("/", studentController.getStudents);
router.get('/profile', verify, verifyStudent, studentController.studentProfile)
router.get('/dashboard', verify, verifyStudent, studentController.getStudentDashboard)
router.get('/my-courses', verify, verifyStudent, studentController.getStudentMyCourses)
router.put('/update-enrollCourses', verify, verifyStudent, studentController.updateEnrollCourses)

// Quiz submission - validates enrollment before allowing submission
router.post('/quiz_submit', verify, verifyStudent, validateEnrollment, studentController.quizSubmission)

router.get('/courses', verify, verifyStudent, studentController.getCoursesByStudentId)
// Get student's quiz submissions (aggregated)
router.get('/quiz-submissions', verify, verifyStudent, studentController.getQuizSubmissions);

// Streak / activity analytics
router.get('/streak', verify, verifyStudent, studentController.getStreakStats);

// Course-related routes for students (public browsing)
router.get("/all-courses", studentController.getAllCourses);
router.get("/courses/:courseId", studentController.getCourseById);

// Enrollment routes
router.post(
  "/courses/:courseId/enroll",
  verify,
  verifyStudent,
  studentController.enrollInCourse
);
router.get("/enrolled-courses", verify, verifyStudent, studentController.getEnrolledCourses);

// Student progress - validates ownership
router.post('/progress', verify, verifyStudent, validateResourceOwnership, studentController.studentProgress)
router.get('/get-progress', verify, verifyStudent, studentController.getStudentProgress)

// Topic completion - validates enrollment before marking complete
router.post('/mark-topic-complete', verify, verifyStudent, validateEnrollment, studentController.markTopicComplete);
router.get('/topic-completion', verify, verifyStudent, studentController.getTopicCompletionStatus);

module.exports = router;
