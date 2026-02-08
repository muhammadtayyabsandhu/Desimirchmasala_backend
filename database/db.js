const { default: mongoose } = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // 👈 yahan fix
    console.log("✅ Database connection established");
  } catch (error) {
    console.log("❌ Database connection error:", error);
  }
};

module.exports = connectDB;
