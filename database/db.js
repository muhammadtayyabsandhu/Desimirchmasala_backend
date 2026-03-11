const mongoose = require("mongoose");

// Track connection state across serverless invocations
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast to catch IP blocks
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ Database connection established");
  } catch (error) {
    console.log("❌ Database connection error:", error);
  }
};

module.exports = connectDB;
