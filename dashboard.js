const express = require("express")
const jwt = require("jsonwebtoken")
const supabase = require("../lib/supabase")

const router = express.Router()

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// Get dashboard stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Get registered sessions count
    const { count: sessionCount } = await supabase
      .from("session_registrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    // Get registered courses count
    const { count: courseCount } = await supabase
      .from("course_registrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    // Get completed courses count
    const { count: completedCount } = await supabase
      .from("course_registrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed")

    // Get upcoming events count
    const { count: upcomingCount } = await supabase
      .from("session_registrations")
      .select(
        `
        *,
        sessions!inner(date)
      `,
        { count: "exact", head: true },
      )
      .eq("user_id", userId)
      .gte("sessions.date", new Date().toISOString().split("T")[0])

    const stats = {
      registeredSessions: sessionCount || 0,
      registeredCourses: courseCount || 0,
      completedCourses: completedCount || 0,
      upcomingEvents: upcomingCount || 0,
    }

    res.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
