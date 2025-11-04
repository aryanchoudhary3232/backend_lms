const express = require("express");
const router = express.Router();
const courseController = require('../controller/courseController')

router.get('/', courseController.getAllCourses)
router.get('/search', courseController.searchCourses);

module.exports = router;
