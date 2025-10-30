const express = require("express");
const router = express.Router();
const { verify } = require("../middleware/verify");
const { verifyAdmin } = require("../middleware/verify");
const {
  getDashboardData,
  getAllUsers,
  getAllCourses,
  deleteCourse,
  getCourseById,
  getTeacherById,
  deleteTeacher,
  deleteStudent,
} = require("../controller/adminController");

// 🟢 Admin Dashboard Data
router.get("/dashboard", verify, verifyAdmin, getDashboardData);

// 👥 Get All Users (Students + Teachers)
router.get("/users", verify, verifyAdmin, getAllUsers);

// �‍🏫 Get Teacher Details by ID
router.get("/teachers/:teacherId", verify, verifyAdmin, getTeacherById);

// ❌ Delete Teacher
router.delete("/teachers/:teacherId", verify, verifyAdmin, deleteTeacher);

// ❌ Delete Student
router.delete("/students/:studentId", verify, verifyAdmin, deleteStudent);

// �📚 Get All Courses
router.get("/courses", verify, verifyAdmin, getAllCourses);

// 📖 Get Course by ID for Admin
router.get("/courses/:courseId", verify, verifyAdmin, getCourseById);

// ❌ Delete a Course
router.delete("/courses/:id", verify, verifyAdmin, deleteCourse);

module.exports = router;
