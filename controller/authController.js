const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

// 🔹 Register User (Student / Teacher / Admin)
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.json({
        message: "Name, email, password, and role are required",
        success: false,
        error: true,
      });
    }

    // ✅ Check if user already exists
    let existingUser =
      (await Student.findOne({ email })) ||
      (await Teacher.findOne({ email })) ||
      (await Admin.findOne({ email }));

    if (existingUser) {
      return res.json({
        message: "User already exists with this email",
        success: false,
        error: true,
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (role === "Student") {
      newUser = new Student({ name, email, password: hashedPassword, role });
    } else if (role === "Teacher") {
      newUser = new Teacher({ name, email, password: hashedPassword, role });
    } else if (role === "Admin") {
      newUser = new Admin({ name, email, password: hashedPassword, role });
    } else {
      return res.json({
        message: "Invalid role provided",
        success: false,
        error: true,
      });
    }

    const savedUser = await newUser.save();

    res.json({
      message: `${role} registered successfully`,
      data: savedUser,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error during registration",
    });

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
  }
}

// 🔹 Login Controller
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        message: "Email and password are required",
        success: false,
        error: true,
      });
    }

    // ✅ Try finding user in all roles
    let user =
      (await Admin.findOne({ email })) ||
      (await Teacher.findOne({ email })) ||
      (await Student.findOne({ email }));

    if (!user) {
      return res.json({
        message: "User does not exist",
        success: false,
        error: true,
      });
    }

    // ✅ Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        message: "Incorrect password",
        success: false,
        error: true,
      });
    }

    // ✅ Generate token
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        email: user.email,
      },
      "aryan123"
    );

    // Inside login function, before sending response...

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Clear time
    let lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;

    if (lastLoginDate) {
      lastLoginDate = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
      
      const diffTime = Math.abs(today - lastLoginDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        // Login is consecutive (yesterday)
        user.streak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        user.streak = 1;
      }
      // If diffDays === 0 (same day), do nothing
    } else {
      // First login ever
      user.streak = 1;
    }

    // Update best streak
    if (user.streak > (user.bestStreak || 0)) {
      user.bestStreak = user.streak;
    }

    user.lastLogin = now;
    await user.save();

    // ... proceed to send response

    res.json({
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
      success: false,
      error: true,
    });
  }
}

module.exports = {
  register,
  login,
};
