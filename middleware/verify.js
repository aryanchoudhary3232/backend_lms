const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// 🔹 Middleware to verify any logged-in user (Student / Teacher / Admin)
function verify(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied, no token provided" });
    }

    // ✅ Extract and verify token
    const token = authHeader.split(" ")[1]; // Correct extraction
    const payload = jwt.verify(token, "aryan123"); // Secret key

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
    const decoded = jwt.verify(token, "aryan123");

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

module.exports = { verify, verifyAdmin };
