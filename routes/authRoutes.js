const express = require("express");
const router = express.Router();

const authController = require('../controller/authController');
const { verify } = require('../middleware/verify');

// ============================================
// 🔹 PUBLIC ROUTES (No authentication required)
// ============================================
router.post("/register", authController.register);
router.post('/login', authController.login);

// ============================================
// 🔹 PROTECTED ROUTES (Authentication required)
// ============================================

// Profile Management - Works for all roles (Student, Teacher, Admin)
router.get('/profile', verify, authController.getProfile);      // Get current user profile
router.put('/profile', verify, authController.updateProfile);   // Update profile (name only)
router.put('/change-password', verify, authController.changePassword); // Change password

module.exports = router;
