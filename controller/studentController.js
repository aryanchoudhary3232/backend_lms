const Student = require("../models/Student");
const QuizSubmission = require("../models/QuizSubmission");
const Course = require("../models/Course");

async function getStudents(req, res) {
  try {
    const students = await Student.find().select("_id name");

    res.json({
      message: "Students retrieved successfully",
      data: students,
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

module.exports = { getStudents, quizSubmission };
