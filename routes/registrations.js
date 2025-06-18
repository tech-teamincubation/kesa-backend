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

// Register for session
router.post("/session/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params
    const userId = req.user.userId

    // Check if already registered
    const { data: existing } = await supabase
      .from("session_registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("session_id", sessionId)
      .single()

    if (existing) {
      return res.status(409).json({ message: "Already registered for this session" })
    }

    // Register for session
    const { data: registration, error } = await supabase
      .from("session_registrations")
      .insert([
        {
          user_id: userId,
          session_id: sessionId,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Session registration error:", error)
      return res.status(500).json({ message: "Registration failed" })
    }

    res.status(201).json({
      message: "Successfully registered for session",
      registration,
    })
  } catch (error) {
    console.error("Session registration error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Register for course
router.post("/course/:courseId", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.userId

    // Check if already registered
    const { data: existing } = await supabase
      .from("course_registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (existing) {
      return res.status(409).json({ message: "Already registered for this course" })
    }

    // Register for course
    const { data: registration, error } = await supabase
      .from("course_registrations")
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Course registration error:", error)
      return res.status(500).json({ message: "Registration failed" })
    }

    res.status(201).json({
      message: "Successfully registered for course",
      registration,
    })
  } catch (error) {
    console.error("Course registration error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
