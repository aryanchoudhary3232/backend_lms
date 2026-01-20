const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

// JWT Configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set!");
  process.exit(1);
}

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
    return res.status(500).json({
      message: "Server error during registration",
      success: false,
      error: true,
    });
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

    // ✅ Generate token with expiration
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
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

// ============================================
// 🔹 PROFILE MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get Profile - Retrieves the current user's profile data
 * Works for all roles (Student, Teacher, Admin) using JWT payload
 * @route GET /auth/profile
 */
async function getProfile(req, res) {
  try {
    const { _id, role } = req.user;

    // Select the appropriate model based on user role
    let user = null;
    if (role === "Student") {
      user = await Student.findById(_id).select("-password");
    } else if (role === "Teacher") {
      user = await Teacher.findById(_id).select("-password");
    } else if (role === "Admin") {
      user = await Admin.findById(_id).select("-password");
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    res.json({
      message: "Profile fetched successfully",
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
    console.error("Get profile error:", error);
    res.status(500).json({
      message: "Server error while fetching profile",
      success: false,
      error: true,
    });
  }
}

/**
 * Update Profile - Updates user's display name
 * Email is read-only and cannot be changed to maintain account integrity
 * @route PUT /auth/profile
 */
async function updateProfile(req, res) {
  try {
    const { _id, role } = req.user;
    const { name } = req.body;

    // Validate name field
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        message: "Name is required and cannot be empty",
        success: false,
        error: true,
      });
    }

    // Select the appropriate model based on user role
    let Model;
    if (role === "Student") {
      Model = Student;
    } else if (role === "Teacher") {
      Model = Teacher;
    } else if (role === "Admin") {
      Model = Admin;
    } else {
      return res.status(400).json({
        message: "Invalid role",
        success: false,
        error: true,
      });
    }

    // Update only the name field (email is read-only)
    const updatedUser = await Model.findByIdAndUpdate(
      _id,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    res.json({
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Server error while updating profile",
      success: false,
      error: true,
    });
  }
}

/**
 * Change Password - Allows user to change their password
 * Requires current password verification before setting new password
 * @route PUT /auth/change-password
 */
async function changePassword(req, res) {
  try {
    const { _id, role } = req.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // ✅ Validate all required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Current password, new password, and confirm password are required",
        success: false,
        error: true,
      });
    }

    // ✅ Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
        success: false,
        error: true,
      });
    }

    // ✅ Validate new password length (minimum 6 characters)
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
        success: false,
        error: true,
      });
    }

    // Select the appropriate model based on user role
    let user = null;
    if (role === "Student") {
      user = await Student.findById(_id);
    } else if (role === "Teacher") {
      user = await Teacher.findById(_id);
    } else if (role === "Admin") {
      user = await Admin.findById(_id);
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    // ✅ Verify current password is correct
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
        success: false,
        error: true,
      });
    }

    // ✅ Prevent using the same password as the new one
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as current password",
        success: false,
        error: true,
      });
    }

    // ✅ Hash the new password and save
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      message: "Server error while changing password",
      success: false,
      error: true,
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
