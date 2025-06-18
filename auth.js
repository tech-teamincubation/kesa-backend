const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const supabase = require("../lib/supabase")

const router = express.Router()

// Register endpoint
router.post(
  "/register",
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Full name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("phone").isMobilePhone().withMessage("Please provide a valid phone number"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { fullName, email, phone, whatsapp, dateOfBirth, gender, city, password } = req.body

      // Check if user already exists
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Insert new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([
          {
            full_name: fullName,
            email,
            phone,
            whatsapp,
            date_of_birth: dateOfBirth,
            gender,
            city,
            password: hashedPassword,
            role: "user",
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Registration error:", error)
        return res.status(500).json({ message: "Registration failed" })
      }

      res.status(201).json({
        message: "User registered successfully",
        userId: newUser.id,
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  },
)

// Login endpoint
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Find user by email
      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, password, full_name, role")
        .eq("email", email)
        .single()

      if (error || !user) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role || "user",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role || "user",
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  },
)

module.exports = router
