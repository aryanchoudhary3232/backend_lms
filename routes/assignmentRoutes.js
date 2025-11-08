const express = require("express");
const router = express.Router();
const { verify } = require("../middleware/verify");
const multer = require("multer");
const { cloudinaryStorage } = require("../cloudinary");

// Configure multer with cloudinary
const upload = multer({ storage: cloudinaryStorage });

const {
  createAssignment,
  getTeacherAssignments,
  getAssignmentSubmissions,
  gradeSubmission,
  updateAssignment,
  deleteAssignment,
  getStudentAssignments,
  submitAssignment,
  getStudentSubmission,
} = require("../controller/assignmentController");

// ============= TEACHER ROUTES =============
router.post(
  "/teacher/create",
  verify,
  upload.array("attachments", 5),
  createAssignment
);
router.get("/teacher/list", verify, getTeacherAssignments);
router.get(
  "/teacher/:assignmentId/submissions",
  verify,
  getAssignmentSubmissions
);
router.post("/teacher/grade/:submissionId", verify, gradeSubmission);
router.put("/teacher/update/:assignmentId", verify, updateAssignment);
router.delete("/teacher/delete/:assignmentId", verify, deleteAssignment);

// ============= STUDENT ROUTES =============
router.get("/student/list", verify, getStudentAssignments);
router.post(
  "/student/submit/:assignmentId",
  verify,
  upload.array("attachments", 3),
  submitAssignment
);
router.get("/student/submission/:assignmentId", verify, getStudentSubmission);

module.exports = router;
