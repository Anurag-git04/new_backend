// connectDB.js

// Only load dotenv for local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");

let cached = global._mongoCache || (global._mongoCache = { conn: null, promise: null });

async function initializeDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL;
  if (!uri) {
    // Throw so caller (index.js) can log this and Vercel shows it
    throw new Error("MONGODB_URI is not set. Check your Vercel Environment Variables.");
  }

  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new MongoDB connection...");
    const opts = {
      // Mongoose 6+ defaults these; leaving them here is fine for clarity
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    };
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected");
    return cached.conn;
  } catch (err) {
    cached.promise = null; // allow retry next time
    console.error("MongoDB connection error:", err);
    throw err; // bubble up so caller can see stack
  }
}

module.exports = { initializeDatabase };