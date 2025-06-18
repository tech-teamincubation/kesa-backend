const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../lib/db"); // ✅ MySQL2 connection

const router = express.Router();

// ✅ Middleware to verify JWT token
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

// ✅ Register for a session
router.post("/session/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    // Check if already registered
    const [existing] = await pool.query(
      "SELECT id FROM session_registrations WHERE user_id = ? AND session_id = ?",
      [userId, sessionId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Already registered for this session" });
    }

    // Register for session
    const [result] = await pool.query(
      "INSERT INTO session_registrations (user_id, session_id, status) VALUES (?, ?, 'pending')",
      [userId, sessionId]
    );

    const insertedId = result.insertId;

    const [registrationRows] = await pool.query(
      "SELECT * FROM session_registrations WHERE id = ?",
      [insertedId]
    );

    res.status(201).json({
      message: "Successfully registered for session",
      registration: registrationRows[0],
    });
  } catch (error) {
    console.error("Session registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Register for a course
router.post("/course/:courseId", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // Check if already registered
    const [existing] = await pool.query(
      "SELECT id FROM course_registrations WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Already registered for this course" });
    }

    // Register for course
    const [result] = await pool.query(
      "INSERT INTO course_registrations (user_id, course_id, status) VALUES (?, ?, 'pending')",
      [userId, courseId]
    );

    const insertedId = result.insertId;

    const [registrationRows] = await pool.query(
      "SELECT * FROM course_registrations WHERE id = ?",
      [insertedId]
    );

    res.status(201).json({
      message: "Successfully registered for course",
      registration: registrationRows[0],
    });
  } catch (error) {
    console.error("Course registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
