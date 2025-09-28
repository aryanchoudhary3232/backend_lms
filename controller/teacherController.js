const Course = require("../models/Course");

async function createCourse(req, res) {
  console.log("...", req.files["image"][0]);
  console.log("...", req.files["video"][0]);
  const { title, description, category, level, duration, price } = req.body;

  const imagePath = req.files ? req.files["image"][0].path : null;
  const videoPath = req.files ? req.files["video"][0].path : null;

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

async function getcourseById(req, res) {
  const course = await Course.findById(req.params.courseId);

  res.json({
    message: "Courses retrieved ",
    data: course,
    success: true,
    error: false,
  });
}

module.exports = { createCourse, getCourses, getcourseById };
