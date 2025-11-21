const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");

// 🟢 Dashboard Data
const getDashboardData = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const courseCount = await Course.countDocuments();

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: { studentCount, teacherCount, courseCount },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

// 👥 Get All Users
const getAllUsers = async (req, res) => {
  try {
    const students = await Student.find().select("-password"); // hide passwords
    const teachers = await Teacher.find().select("-password");

    res.status(200).json({
      success: true,
      message: "All users retrieved successfully",
      data: { students, teachers },
    });
  } catch (error) {
    console.error("Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// 📚 Get All Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("teacher", "name email");
    res.status(200).json({
      success: true,
      message: "All courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Courses Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

// ❌ Delete Course
const deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting course",
    });
  }
};

// 📖 Get Course by ID for Admin
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("teacher", "name email")
      .populate("students", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (error) {
    console.error("Course Detail Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course details",
    });
  }
};

// 👨‍🏫 Get Teacher Details by ID
const getTeacherById = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId)
      .select("-password")
      .populate("courses", "title description thumbnail");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher details retrieved successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Teacher Detail Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching teacher details",
    });
  }
};

// ❌ Delete Teacher
const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Find teacher first to check if they have courses
    const teacher = await Teacher.findById(teacherId).populate("courses");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Delete all courses created by this teacher
    if (teacher.courses && teacher.courses.length > 0) {
      await Course.deleteMany({ teacher: teacherId });
    }

    // Delete the teacher
    await Teacher.findByIdAndDelete(teacherId);

    res.status(200).json({
      success: true,
      message: "Teacher and their courses deleted successfully",
      data: {
        deletedCoursesCount: teacher.courses.length,
      },
    });
  } catch (error) {
    console.error("Delete Teacher Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting teacher",
    });
  }
};

// ❌ Delete Student
const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Remove student from all enrolled courses
    await Course.updateMany(
      { students: studentId },
      { $pull: { students: studentId } }
    );

    // Delete the student
    await Student.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete Student Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting student",
    });
  }
};

// ✅ Approve Teacher Verification
const approveTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { notes } = req.body;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    teacher.verificationStatus = "Verified";
    teacher.verificationNotes = notes || "Your qualification has been verified and approved by admin.";
    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Teacher verification approved successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Approve Teacher Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving teacher",
    });
  }
};

// ❌ Reject Teacher Verification
const rejectTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { notes } = req.body;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    teacher.verificationStatus = "Rejected";
    teacher.verificationNotes = notes || "Your qualification document was rejected. Please re-upload a valid document.";
    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Teacher verification rejected",
      data: teacher,
    });
  } catch (error) {
    console.error("Reject Teacher Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting teacher",
    });
  }
};

module.exports = {
  getDashboardData,
  getAllUsers,
  getAllCourses,
  deleteCourse,
  getCourseById,
  getTeacherById,
  deleteTeacher,
  deleteStudent,
  approveTeacher,
  rejectTeacher,
};
