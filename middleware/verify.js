const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Validate JWT_SECRET is configured
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set!");
  process.exit(1);
}

// 🔹 Middleware to verify any logged-in user (Student / Teacher / Admin)
function verify(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied, no token provided" });
    }

    // ✅ Extract and verify token
    const token = authHeader.split(" ")[1]; // Correct extraction
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload; // Attach payload to request
    next();
  } catch (error) {
    console.error("Error in verify middleware:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

// 🔹 Middleware to verify Admin only
async function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Optional: Check admin exists in DB
    const admin = await Admin.findById(decoded._id);
    if (!admin || admin.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied, Admins only" });
    }

    req.user = admin; // Attach admin object to request
    next();
  } catch (error) {
    console.error("Error in verifyAdmin middleware:", error);
    return res.status(403).json({ message: "Access denied or invalid token" });
  }
}

// 🔹 Middleware to verify Teacher only
function verifyTeacher(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied, no user in request" });
    }
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can access this resource" });
    }
    next();
  } catch (error) {
    console.error("Error in verifyTeacher middleware:", error);
    return res.status(500).json({ message: "Server error" });
  }
}


module.exports = { verify, verifyAdmin, verifyTeacher };
