const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
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
    enum: ["Teacher"],
    required: true,
  },
  qualificationDoc: {
    url: String,         
    publicId: String,     
    resourceType: String,   
    format: String,        
    bytes: Number,
    uploadedAt: {
      type: Date,
      default: null,
    },
  },
  verificationStatus: {
    type: String,
    enum: ["NotSubmitted", "Pending", "Verified", "Rejected"],
    default: "NotSubmitted",
  },
  verificationNotes: {
    type: String,
    default: "",
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
