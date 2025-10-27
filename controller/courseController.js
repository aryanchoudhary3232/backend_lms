const Course = require("../models/Course");

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

module.exports = {getAllCourses}