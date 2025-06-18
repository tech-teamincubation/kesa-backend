const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../lib/db"); // MySQL2 connection

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// GET /api/dashboard/stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Registered sessions
    const [[sessionCount]] = await pool.query(
      "SELECT COUNT(*) AS count FROM session_registrations WHERE user_id = ?",
      [userId]
    );

    // Registered courses
    const [[courseCount]] = await pool.query(
      "SELECT COUNT(*) AS count FROM course_registrations WHERE user_id = ?",
      [userId]
    );

    // Completed courses
    const [[completedCount]] = await pool.query(
      "SELECT COUNT(*) AS count FROM course_registrations WHERE user_id = ? AND status = 'completed'",
      [userId]
    );

    // Upcoming events (sessions in the future)
    const [[upcomingCount]] = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM session_registrations sr
      JOIN sessions s ON sr.session_id = s.id
      WHERE sr.user_id = ? AND s.date >= CURDATE()
      `,
      [userId]
    );

    const stats = {
      registeredSessions: sessionCount.count || 0,
      registeredCourses: courseCount.count || 0,
      completedCourses: completedCount.count || 0,
      upcomingEvents: upcomingCount.count || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
