const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");
const { notFound } = require("../utils/respond");

// ============= TEACHER FUNCTIONS =============

// Create Assignment (Teacher)
async function createAssignment(req, res) {
  try {
    const {
      title,
      description,
      instructions,
      course,
      chapter,
      maxMarks,
      dueDate,
      allowLateSubmission,
      submissionType,
    } = req.body;
    const teacherId = req.user.userId;

    // Verify course belongs to teacher
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return notFound(res, "Course");
    }
    if (courseDoc.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "You can only create assignments for your own courses",
      });
    }

    // Handle file attachments (if any)
    const attachments = req.files
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.filename,
          filename: file.originalname,
        }))
      : [];

    const assignment = new Assignment({
      title,
      description,
      instructions,
      course,
      chapter,
      teacher: teacherId,
      maxMarks,
      dueDate: new Date(dueDate),
      attachments,
      allowLateSubmission:
        allowLateSubmission === "true" || allowLateSubmission === true,
      submissionType,
      status: "active",
    });

    await assignment.save();

    return res.status(201).json({
      success: true,
      error: false,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("createAssignment error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while creating assignment",
    });
  }
}

// Get Teacher's Assignments
async function getTeacherAssignments(req, res) {
  try {
    const teacherId = req.user.userId;
    const { courseId } = req.query;

    const query = { teacher: teacherId };
    if (courseId) query.course = courseId;

    const assignments = await Assignment.find(query)
      .populate("course", "title")
      .sort({ createdAt: -1 });

    // Get submission counts for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const totalSubmissions = await Submission.countDocuments({
          assignment: assignment._id,
        });
        const gradedSubmissions = await Submission.countDocuments({
          assignment: assignment._id,
          status: "graded",
        });

        return {
          ...assignment.toObject(),
          stats: {
            totalSubmissions,
            gradedSubmissions,
            pendingGrading: totalSubmissions - gradedSubmissions,
          },
        };
      })
    );

    return res.json({
      success: true,
      error: false,
      message: "Assignments retrieved successfully",
      data: assignmentsWithStats,
    });
  } catch (error) {
    console.error("getTeacherAssignments error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while fetching assignments",
    });
  }
}

// Get Assignment Submissions (Teacher)
async function getAssignmentSubmissions(req, res) {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.userId;

    // Verify assignment belongs to teacher
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return notFound(res, "Assignment");
    }
    if (assignment.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Unauthorized access",
      });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name email")
      .sort({ submittedAt: -1 });

    return res.json({
      success: true,
      error: false,
      message: "Submissions retrieved successfully",
      data: {
        assignment,
        submissions,
      },
    });
  } catch (error) {
    console.error("getAssignmentSubmissions error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while fetching submissions",
    });
  }
}

// Grade Submission (Teacher)
async function gradeSubmission(req, res) {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;
    const teacherId = req.user.userId;

    const submission = await Submission.findById(submissionId).populate(
      "assignment"
    );

    if (!submission) {
      return notFound(res, "Submission");
    }

    // Verify teacher owns the assignment
    if (submission.assignment.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Unauthorized access",
      });
    }

    // Validate marks
    if (marks > submission.assignment.maxMarks) {
      return res.status(400).json({
        success: false,
        error: true,
        message: `Marks cannot exceed maximum marks (${submission.assignment.maxMarks})`,
      });
    }

    submission.grade = {
      marks: Number(marks),
      feedback: feedback || "",
      gradedAt: new Date(),
      gradedBy: teacherId,
    };
    submission.status = "graded";

    await submission.save();

    return res.json({
      success: true,
      error: false,
      message: "Submission graded successfully",
      data: submission,
    });
  } catch (error) {
    console.error("gradeSubmission error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while grading submission",
    });
  }
}

// Update Assignment (Teacher)
async function updateAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.userId;
    const updates = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return notFound(res, "Assignment");
    }
    if (assignment.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Unauthorized access",
      });
    }

    Object.assign(assignment, updates);
    await assignment.save();

    return res.json({
      success: true,
      error: false,
      message: "Assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("updateAssignment error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while updating assignment",
    });
  }
}

// Delete Assignment (Teacher)
async function deleteAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.userId;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return notFound(res, "Assignment");
    }
    if (assignment.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Unauthorized access",
      });
    }

    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignment: assignmentId });

    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);

    return res.json({
      success: true,
      error: false,
      message: "Assignment and all submissions deleted successfully",
    });
  } catch (error) {
    console.error("deleteAssignment error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while deleting assignment",
    });
  }
}

// ============= STUDENT FUNCTIONS =============

// Get Student's Assignments
async function getStudentAssignments(req, res) {
  try {
    const studentId = req.user.userId;
    const { courseId, status } = req.query;

    // Get enrolled courses
    const Student = require("../models/Student");
    const student = await Student.findById(studentId).select("enrolledCourses");
    const enrolledCourseIds = student.enrolledCourses.map((c) => c.toString());

    // Build query
    const query = {
      course: { $in: enrolledCourseIds },
      status: "active",
    };
    if (courseId) query.course = courseId;

    const assignments = await Assignment.find(query)
      .populate("course", "title")
      .populate("teacher", "name")
      .sort({ dueDate: 1 });

    // Get submission status for each assignment
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignment: assignment._id,
          student: studentId,
        });

        const now = new Date();
        const isOverdue = now > assignment.dueDate && !submission;

        return {
          ...assignment.toObject(),
          submissionStatus: {
            submitted: !!submission,
            isOverdue,
            grade: submission?.grade || null,
            submittedAt: submission?.submittedAt || null,
          },
        };
      })
    );

    // Filter by status if provided
    let filteredAssignments = assignmentsWithStatus;
    if (status === "pending") {
      filteredAssignments = assignmentsWithStatus.filter(
        (a) => !a.submissionStatus.submitted
      );
    } else if (status === "submitted") {
      filteredAssignments = assignmentsWithStatus.filter(
        (a) => a.submissionStatus.submitted
      );
    } else if (status === "graded") {
      filteredAssignments = assignmentsWithStatus.filter(
        (a) => a.submissionStatus.grade?.marks !== null
      );
    }

    return res.json({
      success: true,
      error: false,
      message: "Assignments retrieved successfully",
      data: filteredAssignments,
    });
  } catch (error) {
    console.error("getStudentAssignments error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while fetching assignments",
    });
  }
}

// Submit Assignment (Student)
async function submitAssignment(req, res) {
  try {
    const { assignmentId } = req.params;
    const { textContent } = req.body;
    const studentId = req.user.userId;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return notFound(res, "Assignment");
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    });
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "You have already submitted this assignment",
      });
    }

    // Check deadline
    const now = new Date();
    const isLate = now > assignment.dueDate;
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        error: true,
        message:
          "Assignment deadline has passed and late submissions are not allowed",
      });
    }

    // Handle file attachments
    const attachments = req.files
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.filename,
          filename: file.originalname,
        }))
      : [];

    const submission = new Submission({
      assignment: assignmentId,
      student: studentId,
      course: assignment.course,
      textContent: textContent || "",
      attachments,
      isLate,
      status: "submitted",
    });

    await submission.save();

    return res.status(201).json({
      success: true,
      error: false,
      message: "Assignment submitted successfully",
      data: submission,
    });
  } catch (error) {
    console.error("submitAssignment error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while submitting assignment",
    });
  }
}

// Get Student's Submission
async function getStudentSubmission(req, res) {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.userId;

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    })
      .populate("assignment")
      .populate("grade.gradedBy", "name");

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "No submission found",
      });
    }

    return res.json({
      success: true,
      error: false,
      message: "Submission retrieved successfully",
      data: submission,
    });
  } catch (error) {
    console.error("getStudentSubmission error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error while fetching submission",
    });
  }
}

module.exports = {
  // Teacher functions
  createAssignment,
  getTeacherAssignments,
  getAssignmentSubmissions,
  gradeSubmission,
  updateAssignment,
  deleteAssignment,

  // Student functions
  getStudentAssignments,
  submitAssignment,
  getStudentSubmission,
};
