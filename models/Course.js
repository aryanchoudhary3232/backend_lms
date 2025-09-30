const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  category: { type: String },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advance"] },
  duration: { type: Number },
  price: { type: Number },
  image: { type: String },
  video: { type: String },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],

  chapters: [
    {
      title: {
        type: String,
      },
      topics: [
        {
          title: String,
          video: String,
        },
      ],
    },
  ],
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
