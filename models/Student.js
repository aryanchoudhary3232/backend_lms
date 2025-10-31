const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Student"],
    required: true,
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  streak: {
    type: Number,
    default: 0,
  },
  lastActiveDateStreak: {
    type: Date,
  },
  bestStreak: {
    type: Number,
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
