const express = require("express")
const supabase = require("../lib/supabase")

const router = express.Router()

// Get all courses
router.get("/", async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Courses fetch error:", error)
      return res.status(500).json({ message: "Failed to fetch courses" })
    }

    res.json(courses)
  } catch (error) {
    console.error("Courses error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get single course
router.get("/:id", async (req, res) => {
  try {
    const { data: course, error } = await supabase.from("courses").select("*").eq("id", req.params.id).single()

    if (error || !course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json(course)
  } catch (error) {
    console.error("Course fetch error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
