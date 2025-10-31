const Student = require("../models/Student");
const QuizSubmission = require("../models/QuizSubmission");
const Course = require("../models/Course");

async function getStudents(req, res) {
  try {
    const students = await Student.find().select("_id name email");
    res.json({
      message: "Students retrieved successfully",
      data: students,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      message: "Error fetching students",
      success: false,
      error: true,
    });
  }
}

async function getCoursesByStudentId(req, res) {
  const courses = await Course.find({ students: req.user._id }).populate({
    path: 'teacher',
    select: 'name'
  })

  res.json({
    message: "Student courses retrieved successfully",
    data: courses,
    success: true,
    error: false,
  });
}

// Get all courses for students to browse
async function getAllCourses(req, res) {
  try {
    const courses = await Course.find().populate("teacher", "name email");
    res.json({
      message: "Courses retrieved successfully",
      data: courses,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      message: "Error fetching courses",
      success: false,
      error: true,
    });
  }
}

// Get a specific course by ID
async function getCourseById(req, res) {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate(
      "teacher",
      "name email"
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        success: false,
        error: true,
      });
    }

    res.json({
      message: "Course retrieved successfully",
      data: course,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      message: "Error fetching course",
      success: false,
      error: true,
    });
  }
}

// Enroll student in a course
async function enrollInCourse(req, res) {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id; // from JWT token

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        success: false,
        error: true,
      });
    }

    // Check if student is already enrolled
    if (course.students.includes(studentId)) {
      return res.json({
        message: "You are already enrolled in this course",
        success: false,
        error: true,
      });
    }

    // Add student to course
    course.students.push(studentId);
    await course.save();

    res.json({
      message: "Successfully enrolled in course",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({
      message: "Error enrolling in course",
      success: false,
      error: true,
    });
  }
}

// Get enrolled courses for a student
async function getEnrolledCourses(req, res) {
  try {
    const studentId = req.user._id; // from JWT token

    const courses = await Course.find({ students: studentId }).populate(
      "teacher",
      "name email"
    );

    res.json({
      message: "Enrolled courses retrieved successfully",
      data: courses,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({
      message: "Error fetching enrolled courses",
      success: false,
      error: true,
    });
  }
}

async function quizSubmission(req, res) {
  try {
    const { courseId, chapterId, topicId, answerQuiz } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    const originalQuiz = course.chapters.id(chapterId).topics.id(topicId).quiz;

    let correct = 0;
    const quiz = originalQuiz.map((q) => {
      const ansObj = answerQuiz.find(
        (ansObj) => ansObj.question === q.question
      );
      console.log("ansObj", ansObj);
      const isCorrect = ansObj.tickOption === q.correctOption;
      if (isCorrect) correct++;

      return {
        questionText: q.question,
        options: q.options,
        tickOption: ansObj.tickOption,
        correctOption: q.correctOption,
        isCorrect,
        explaination: q.explaination,
      };
    });

    const score = `${Math.round((correct / originalQuiz.length) * 100)}%`;

    const submission = new QuizSubmission({
      studentId,
      courseId,
      chapterId,
      topicId,
      quiz,
      correct,
      totalQuestions: originalQuiz.length,
      score,
    });
    const data = await submission.save();

    res.json({
      message: "Quiz submitted successfully",
      data: data,
      success: true,
      error: false,
    });
  } catch (error) {
    console.log("error occured...", error);
    res.json({
      message: error,
      success: false,
      error: true,
    });
  }
}

module.exports = {
  getStudents,
  getAllCourses,
  getCourseById,
  enrollInCourse,
  getEnrolledCourses,
  quizSubmission,
  getCoursesByStudentId,
};
