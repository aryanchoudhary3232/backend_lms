const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");

// 🟢 Dashboard Data
const getDashboardData = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const courseCount = await Course.countDocuments();

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: { studentCount, teacherCount, courseCount },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

// 👥 Get All Users
const getAllUsers = async (req, res) => {
  try {
    const students = await Student.find().select("-password"); // hide passwords
    const teachers = await Teacher.find().select("-password");

    res.status(200).json({
      success: true,
      message: "All users retrieved successfully",
      data: { students, teachers },
    });
  } catch (error) {
    console.error("Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// 📚 Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("teacher", "name email");
    res.status(200).json({
      success: true,
      message: "All courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Courses Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

// ❌ Delete Course
const deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting course",
    });
  }
};

module.exports = {
  getDashboardData,
  getAllUsers,
  getAllCourses,
  deleteCourse,
};
