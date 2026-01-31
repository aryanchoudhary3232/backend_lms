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

// Validate required environment variables
const requiredEnvVars = ['MONGO_URL_ATLAS', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || false
    : true,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const MONGO_URL = process.env.MONGO_URL_ATLAS;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("mongodb connected successfully");
  })
  .catch((err) => {
    console.log("err in mongodb connection:", err);
    process.exit(1);
  });

app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);

// contact form
app.use('/contact', contactRoutes);

// cart routes
app.use('/cart', cartRoutes);

//teacher routes
app.use("/teacher", teacherRoutes);

// student routes
app.use("/student", studentRoutes);

// admin routes
app.use("/admin", adminRoutes);

// assignment routes
app.use("/assignments", assignmentRoutes);

// flashcard routes
app.use('/api/flashcards', flashcardRoutes);

// stats routes
app.use("/stats", statsRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to server");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`backend server is running on port ${PORT}....`);
});
