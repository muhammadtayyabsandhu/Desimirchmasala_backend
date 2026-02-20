require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("./models/orderModel");
const sendOrderNotification = require("./utils/sendOrderNotification");

async function testRealOrder() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Get the most recent order
    const order = await Order.findOne().sort({ createdAt: -1 });

    if (!order) {
        console.log("No orders found");
        process.exit(0);
    }

    console.log("Testing with order:", order.orderId);
    try {
        await sendOrderNotification(order);
        console.log("✅ Successfully sent real order email!");
    } catch (err) {
        console.error("❌ Failed to send:", err);
    }

    mongoose.disconnect();
}

testRealOrder();
