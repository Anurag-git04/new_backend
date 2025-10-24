const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { initializeDatabase } = require("./config/connectDB");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// // Global connection state (important for Vercel)
// let isConnected = false;

// // MongoDB connection function
// async function connectToMongoDB() {
//   if (isConnected) {
//     console.log("✅ Using existing MongoDB connection");
//     return;
//   }

//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000,
//     });

//     isConnected = conn.connections[0].readyState === 1;
//     console.log("✅ MongoDB connected successfully");
//   } catch (error) {
//     console.error("❌ Error connecting to MongoDB:", error.message);
//   }
// }

// // Connect once (works both locally and in Vercel)
// connectToMongoDB();

// initialize DB and make sure any error is logged with stack
initializeDatabase().catch((err) => {
  console.error("Failed to initialize database (index.js):", err);
  // don't crash here; Vercel will show logs for incoming requests
});

// Routes
app.use("/auth", require("./routes/authRouter"));
app.use("/api/albums", require("./routes/albumRouter"));
app.use("/api/images", require("./routes/imageRouter"));

app.get("/", (req, res) => {
  res.send("Hello World from KviosPix Backend!");
});

// Local run (only if run directly)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

// Export for Vercel serverless
module.exports = app;
