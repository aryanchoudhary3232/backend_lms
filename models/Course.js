const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Course title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, "Course category is required"],
    trim: true
  },
  level: {
    type: String,
    enum: {
      values: ["Beginner", "Intermediate", "Advance"],
      message: "Level must be Beginner, Intermediate, or Advance"
    },
    default: "Beginner"
  },
  duration: {
    type: Number,
    min: [0, "Duration cannot be negative"]
  },
  price: {
    type: Number,
    required: [true, "Course price is required"],
    min: [0, "Price cannot be negative"]
  },
  image: { type: String },
  video: { type: String },
  notes: { type: String },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: [true, "Course must have a teacher"]
  },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],

  // Ratings array: students can rate courses they purchased/enrolled
  ratings: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      rating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
      },
      review: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  chapters: [
    {
      title: {
        type: String,
        required: [true, "Chapter title is required"],
        trim: true
      },
      topics: [
        {
          title: { type: String, trim: true },
          video: String,
          quiz: [
            {
              question: {
                type: String,
                required: [true, "Quiz question is required"]
              },
              options: [
                {
                  type: String,
                },
              ],
              correctOption: {
                type: String,
              },
              // Fixed typo: was "explaination"
              explanation: {
                type: String,
              },
            },
          ],
        },
      ],
    },
  ],
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
courseSchema.index({ teacher: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
