const jwt = require("jsonwebtoken");

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

async function register(req, res) {
  const { name, email, password, role } = req.body;
  console.log(req.body);
  if (!name || !email || !password || !role) {
    res.json({
      message: "name, email, password and role are required",
      success: false,
      error: true,
    });
  }

  let response;
  if (role === "Student") {
    const student = new Student({
      name,
      email,
      password,
      role,
    });

    response = await student.save();
  } else if (role === "Teacher") {
    const teacher = new Teacher({
      name,
      email,
      password,
      role,
    });

    response = await teacher.save();
  }

  res.json({
    message: "User successfully registered",
    data: response,
    success: true,
    error: false,
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.json({
      message: "email and password are required",
      success: false,
      error: true,
    });
  }

  const admin = await Admin.findOne({ email });
  const student = await Student.findOne({ email });
  const teacher = await Teacher.findOne({ email });

  if (!admin && !student && !teacher) {
    res.json({
      message: "User does not exist.",
      success: false,
      error: true,
    });
  }

  if (admin) {
    if (admin.password !== password) {
      res.json({
        message: "password entered is wrong",
        success: false,
        error: true,
      });
    }

    res.json({
      message: "login successfully",
      data: admin,
      success: true,
      error: false,
    });
  }

  if (student) {
    if (student.password !== password) {
      res.json({
        message: "password entered is wrong",
        success: false,
        error: true,
      });
    }

    const token = jwt.sign({ _id: student._id, role: "Student" }, "aryan123", {
      expiresIn: "1d",
    });

    res.json({
      message: "login successfully",
      data: student,
      token: token,
      success: true,
      error: false,
    });
  } else if (teacher) {
    if (teacher.password !== password) {
      res.json({
        message: "password entered is wrong",
        success: false,
        error: true,
      });
    }

    const token = jwt.sign({ _id: teacher._id, role: "Teacher" }, "aryan123", {
      expiresIn: "1d",
    });

    res.json({
      message: "login successfully",
      data: teacher,
      token: token,
      success: true,
      error: false,
    });
  }
}

module.exports = { register, login };
