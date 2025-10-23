const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentController");
const { verify } = require("../middleware/verify");

router.get("/", studentController.getStudents);
router.post('/quiz_submit',verify, studentController.quizSubmission)

module.exports = router;
