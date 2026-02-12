const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config(); // ✅ sabse pehle load karo

const connectDB = require("./database/db.js");
const userRouter = require("./routes/userRouter.js");
const productRouter = require("./routes/productRouter.js");
const orderRouter = require("./routes/orderRoute.js");

const app = express();

// ✅ Trust Proxy for Railway/Heroku (Required for Secure Cookies)
app.set("trust proxy", 1);

//Database
connectDB();

// ✅ Check loaded vars
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}
if (!process.env.PORT) {
  console.error("❌ PORT is missing in .env file");
  process.exit(1);
}

//PORT
const PORT = process.env.PORT || 5173;

//Middleware
app.use(express.json());

// ✅ Updated CORS to allow live frontend domain
app.use(
  cors({
    origin: ["http://localhost:5173", "https://desimirchmasala.com", "https://www.desimirchmasala.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

//Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);

//Start server
app.listen(PORT, () => {
  console.log(`✅ Example app listening on port ${PORT}`);
});
