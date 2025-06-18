const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const supabase = require("../lib/supabase")

const router = express.Router()

// Admin login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find admin user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, full_name, role")
      .eq("email", email)
      .eq("role", "admin")
      .single()

    if (error || !user) {
      return res.status(401).json({ message: "Invalid admin credentials" })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid admin credentials" })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: "admin",
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
