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



const searchCourses = async (req, res) => {
  try {
    const { query, category, level } = req.query;
    
    let searchQuery = {};
    
    // Build search query based on parameters
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (category) {
      searchQuery.category = category;
    }
    
    if (level) {
      searchQuery.level = level;
    }

    const courses = await Course.find(searchQuery)
      .populate("teacher", "name email");

    res.status(200).json({
      success: true,
      message: "Courses found successfully",
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching courses",
    });
  }
};

module.exports = {
  getAllCourses,
  searchCourses
};