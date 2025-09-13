const User = require("../models/User");

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

  const user = new User({
    name,
    email,
    password,
    role
  });

  const response = await user.save();

  res.json({
    message: "User successfully registered",
    data: user,
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

  const user = await User.findOne({ email });

  if (!user) {
    res.json({
      message: "User does not exist.",
      success: false,
      error: true,
    });
  }

  if (user.password !== password) {
    res.json({
      message: "password entered is wrong",
      success: false,
      error: true,
    });
  }

  res.json({
    message: "login successfully",
    data: user,
    success: true,
    error: false,
  });
}

module.exports = { register, login };
