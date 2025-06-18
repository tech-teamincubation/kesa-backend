const express = require("express")
const router = express.Router()
const pool = require('../lib/db'); // MySQL2 connection

// Get all sessions
router.get("/", async (req, res) => {
  try {
    const { data: sessions, error } = await supabase.from("sessions").select("*").order("date", { ascending: true })

    if (error) {
      console.error("Sessions fetch error:", error)
      return res.status(500).json({ message: "Failed to fetch sessions" })
    }

    res.json(sessions)
  } catch (error) {
    console.error("Sessions error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get single session
router.get("/:id", async (req, res) => {
  try {
    const { data: session, error } = await supabase.from("sessions").select("*").eq("id", req.params.id).single()

    if (error || !session) {
      return res.status(404).json({ message: "Session not found" })
    }

    res.json(session)
  } catch (error) {
    console.error("Session fetch error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
