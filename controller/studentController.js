const Student = require("../models/Student");

async function getStudents(req, res) {
  const students = await Student.find().select("_id name");

  res.json({
    message: "Students retrieved successfully",
    data: students,
    success: true,
    error: false,
  });
}

module.exports = { getStudents };
