const express = require("express");
const router = express.Router();
const { verify } = require("../middleware/verify");
const { verifyAdmin } = require("../middleware/verify");
const {
  getDashboardData,
  getAllUsers,
  getAllCourses,
  deleteCourse,
} = require("../controller/adminController");

// 🟢 Admin Dashboard Data
router.get("/dashboard", verify, verifyAdmin, getDashboardData);

// 👥 Get All Users (Students + Teachers)
router.get("/users", verify, verifyAdmin, getAllUsers);

// 📚 Get All Courses
router.get("/courses", verify, verifyAdmin, getAllCourses);

// ❌ Delete a Course
router.delete("/courses/:id", verify, verifyAdmin, deleteCourse);

module.exports = router;
