const express = require("express");
const router = express.Router();
const { verify, verifyAdmin } = require("../middleware");
const {
  getDashboardData,
  getAllUsers,
  getAllCourses,
  deleteCourse,
  getCourseById,
  getTeacherById,
  deleteTeacher,
  deleteStudent,
  approveTeacher,
  rejectTeacher,
} = require("../controller/adminController");

// ===== ROUTER-BASED MIDDLEWARE =====
// All admin routes require authentication + admin role
router.use(verify);
router.use(verifyAdmin);

// 🟢 Admin Dashboard Data
router.get("/dashboard", getDashboardData);

// 👥 Get All Users (Students + Teachers)
router.get("/users", getAllUsers);

// 👨‍🏫 Get Teacher Details by ID
router.get("/teachers/:teacherId", getTeacherById);

// ✅ Approve Teacher Verification
router.put("/teachers/:teacherId/approve", approveTeacher);

// ❌ Reject Teacher Verification
router.put("/teachers/:teacherId/reject", rejectTeacher);

// ❌ Delete Teacher
router.delete("/teachers/:teacherId", deleteTeacher);

// ❌ Delete Student
router.delete("/students/:studentId", deleteStudent);

// �📚 Get All Courses
router.get("/courses", getAllCourses);

// 📖 Get Course by ID for Admin
router.get("/courses/:courseId", getCourseById);

// ❌ Delete a Course
router.delete("/courses/:id", deleteCourse);

module.exports = router;
