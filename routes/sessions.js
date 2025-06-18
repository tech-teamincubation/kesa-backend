const express = require("express");
const router = express.Router();
const pool = require("../lib/db"); // MySQL2 connection

// ✅ Get all sessions
router.get("/", async (req, res) => {
  try {
    const [sessions] = await pool.query("SELECT * FROM sessions ORDER BY date ASC");
    res.json(sessions);
  } catch (error) {
    console.error("Sessions fetch error:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// ✅ Get single session by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM sessions WHERE id = ?", [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Session fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
