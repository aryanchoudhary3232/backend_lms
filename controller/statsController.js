const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');

exports.getPublicStats = async (req, res) => {
  try {
    // 1. Count Students (from Student collection)
    const students = await Student.countDocuments();

    // 2. Count Instructors (from Teacher collection)
    const instructors = await Teacher.countDocuments();

    // 3. Count Materials (Total number of courses)
    const materials = await Course.countDocuments({});

    // 4. Count Videos (Sum of 'lessons' or 'videos' field in all courses)
    // We use MongoDB aggregation to sum up a field across all documents
    const videoData = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalVideos: { $sum: "$lessons" } // Change "$lessons" to whatever your field name is (e.g. "$videoCount")
        }
      }
    ]);
    const videos = videoData.length > 0 ? videoData[0].totalVideos : 0;

    res.status(200).json({
      success: true,
      stats: {
        students,
        instructors,
        videos,
        materials
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};