const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const teacherRoutes = require("./routes/teacherRoutes");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect("mongodb://localhost:27017/lms")
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log("err in mongodb", err));

app.use("/auth", authRoutes);
app.use("/teacher/courses", teacherRoutes);

app.listen(3000, () => {
  console.log("backend server is running on port 3000....");
});
