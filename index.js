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

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const MONGO_URL =
  process.env.MONGO_URL_ATLAS ||
  "mongodb+srv://aryan:aryan123@cluster0.qxutmim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

app.get("/", (req, res) => {
  res.send("Welcome to server");
});

app.listen(3000, () => {
  console.log("backend server is running on port 3000....");
});
