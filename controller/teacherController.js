const Course = require("../models/Course");

async function createCourse(req, res) {
  const { title, description, category, level, duration, price } = req.body;

  const imagePath = req.files ? req.files["image"][0].path : null;
  const videoPath = req.files ? req.files["video"][0].path : null;
  console.log('..', req.files['image'][0])
  console.log('..', req.files['video'][0])

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
