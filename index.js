const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const cartRoutes = require("./routes/cartRoutes");
const flashcardRoutes = require('./routes/flashcardRoutes');
const statsRoutes = require("./routes/statsRoutes");

// ✅ Configure CORS with allowed origins
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ MongoDB connection - no hardcoded fallback
const MONGO_URL = process.env.MONGO_URL_ATLAS || process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("FATAL: MongoDB connection string not configured. Set MONGO_URL or MONGO_URL_ATLAS in .env");
  process.exit(1);
}

// ✅ Start server only after successful DB connection
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully");

    // Register routes
    app.use("/auth", authRoutes);
    app.use("/courses", courseRoutes);
    app.use('/contact', contactRoutes);
    app.use('/cart', cartRoutes);
    app.use("/teacher", teacherRoutes);
    app.use("/student", studentRoutes);
    app.use("/admin", adminRoutes);
    app.use("/assignments", assignmentRoutes);
    app.use('/api/flashcards', flashcardRoutes);
    app.use("/stats", statsRoutes);

    app.get("/", (req, res) => {
      res.send("Welcome to LMS API Server");
    });

    // Start listening only after DB is connected
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });
