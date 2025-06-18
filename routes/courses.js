const express = require("express");
const router = express.Router();
const pool = require("../lib/db"); // ✅ MySQL2 connection

// ✅ Get all courses
router.get("/", async (req, res) => {
  try {
    const [courses] = await pool.query("SELECT * FROM courses ORDER BY created_at DESC");
    res.json(courses);
  } catch (error) {
    console.error("Courses fetch error:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// ✅ Get single course by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM courses WHERE id = ?", [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Course fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
