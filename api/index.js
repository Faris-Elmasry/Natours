const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables - Vercel will use its own environment variables in production,
// but this allows local testing with the config.env if needed.
dotenv.config({ path: path.join(__dirname, "../config.env") });

const app = require("../app");

// Build database connection string
// In Vercel, DATABASE and DATABASE_PASSWORD must be set in the project settings.
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Connect to MongoDB
mongoose
  .connect(DB)
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
  });

// Export the Express app for Vercel serverless functions
module.exports = app;
