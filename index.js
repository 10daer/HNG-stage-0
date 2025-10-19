const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Constants
const CAT_FACTS_API = "https://catfact.ninja/fact";
const API_TIMEOUT = 5000; // 5 seconds timeout
const FALLBACK_FACT =
  "Cats are fascinating creatures with unique personalities.";

// Helper function to fetch cat fact
async function fetchCatFact() {
  try {
    const response = await axios.get(CAT_FACTS_API, {
      timeout: API_TIMEOUT,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.data && response.data.fact) {
      console.log("✓ Cat fact fetched successfully");
      return response.data.fact;
    }

    console.warn("⚠ Cat Facts API returned unexpected format");
    return FALLBACK_FACT;
  } catch (error) {
    console.error("✗ Error fetching cat fact:", error.message);

    // Return fallback fact instead of failing the entire request
    return FALLBACK_FACT;
  }
}

// GET /me endpoint
app.get("/me", async (req, res) => {
  try {
    // Fetch cat fact dynamically
    const catFact = await fetchCatFact();

    // Generate current UTC timestamp in ISO 8601 format
    const timestamp = new Date().toISOString();

    // Build response object
    const response = {
      status: "success",
      user: {
        email: process.env.USER_EMAIL || "your.email@example.com",
        name: process.env.USER_NAME || "Your Full Name",
        stack: process.env.USER_STACK || "Node.js/Express",
      },
      timestamp: timestamp,
      fact: catFact,
    };

    // Set correct content type and return response
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(response);

    console.log("✓ Profile endpoint responded successfully");
  } catch (error) {
    console.error("✗ Error in /me endpoint:", error);

    // Return error response
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend Wizards - Stage 0 API",
    endpoints: {
      profile: "/me",
      health: "/health",
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Backend Wizards - Stage 0 API        ║
╚════════════════════════════════════════╝
🚀 Server running on port ${PORT}
📍 Profile endpoint: http://localhost:${PORT}/me
🏥 Health check: http://localhost:${PORT}/health
⏰ Started at: ${new Date().toISOString()}
  `);
});
