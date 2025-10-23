const Course = require("../models/Course");
const Teacher = require("../models/Teacher");

async function getTeachers(req, res) {
  const teachers = await Teacher.find().select("_id name");

  res.json({
    message: "Teachers retrieved successfully",
    data: teachers,
    success: true,
    error: false,
  });
}

async function createCourse(req, res) {
  const { title, description, category, level, duration, price, teacher } =
    req.body;

  let chapters = JSON.parse(req.body.chapters);

  const imageFile = req.files.find((f) => f.fieldname === "image");
  const videoFile = req.files.find((f) => f.fieldname === "video");

  const imagePath = imageFile.path;
  const videoPath = videoFile.path;

  const newChapters = chapters.map((chapter, chapterIdx) => {
    return {
      title: chapter.title,
      topics: chapter.topics.map((topic, topicIdx) => {
        const fileKey = `chapters[${chapterIdx}][topics][${topicIdx}][video]`;

        const topicVideoFile = req.files.find((f) => f.fieldname === fileKey);
        const topicVideoPath = topicVideoFile.path;

        return {
          title: topic.title,
          video: topicVideoPath,
          quiz: topic.quiz,
        };
      }),
    };
  });

  const course = new Course({
    title,
    description,
    category,
    level,
    duration,
    price,
    image: imagePath,
    video: videoPath,
    teacher,
    chapters: newChapters,
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
  const course = await Course.findById(req.params.courseId, {
    'chapters.topics.quiz.correctOption': 0,
    'chapters.topics.quiz.explaination': 0
  });

  res.json({
    message: "Courses retrieved ",
    data: course,
    success: true,
    error: false,
  });
}

module.exports = { getTeachers, createCourse, getCourses, getcourseById };
