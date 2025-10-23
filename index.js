const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const MONGO_URL = process.env.MONGO_URL_ATLAS;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log("err in mongodb", err));

app.use("/auth", authRoutes);

//teacher routes
app.use("/teacher", teacherRoutes);

// student routes
app.use("/student", studentRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to server");
});

app.listen(3000, () => {
  console.log("backend server is running on port 3000....");
});
