const Course = require("../models/Course");

async function createCourse(req, res) {
  const { title, description, category, level, duration, price } = req.body;

  const imagePath = req.files
    ? `http://localhost:3000/uploads/${req.files["image"][0].filename}`
    : null;
  const videoPath = req.files
    ? `http://localhost:3000/uploads/${req.files["video"][0].filename}`
    : null;

  const course = new Course({
    title,
    description,
    category,
    level,
    duration,
    price,
    image: imagePath,
    video: videoPath,
  });

  const response = await course.save();

  res.json({
    message: "Course created succesfully",
    data: response,
    success: true,
    error: false,
  });
}

async function getCourses(req, res) {
  const courses = await Course.find();

  res.json({
    message: "Courses retrieved ",
    data: courses,
    success: true,
    error: false,
  });
}

module.exports = { createCourse, getCourses };
