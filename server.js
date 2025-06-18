const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://kesalearn.com",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use("/api/", limiter)

// Logging
app.use(morgan("combined"))

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/dashboard", require("./routes/dashboard"))
app.use("/api/admin", require("./routes/admin"))
app.use("/api/sessions", require("./routes/sessions"))
app.use("/api/courses", require("./routes/courses"))
app.use("/api/registrations", require("./routes/registrations"))

// 404 handler

// Optional: Mirror /health under /api/health for frontend compatibility
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

app.listen(PORT, () => {
  console.log(`🚀 KESA Backend server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})
