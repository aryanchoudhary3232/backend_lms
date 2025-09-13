const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const teacherController = require("../controller/teacherController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../", "uploads"));
  },
  filename: (req, file, cb) => {
    const suffix = Date.now();
    cb(null, suffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/create_course",
  upload.fields([{ name: "image" }, { name: "video" }]),
  teacherController.createCourse
);
router.get("/getCourses", teacherController.getCourses);

module.exports = router;
