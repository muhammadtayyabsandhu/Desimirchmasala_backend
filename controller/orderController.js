const Order = require("../models/orderModel.js");
const sendOrderNotification = require("../utils/sendOrderNotification.js");

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      province,
      city,
      area,
      colony,
      buildingNo,
      products,
      totalAmount,
      paymentMethod,
    } = req.body;

    const userId = req.user._id;

    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const order = await Order.create({
      userId,
      orderId,
      fullName,
      phone,
      province,
      city,
      area,
      colony,
      buildingNo,
      products,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      // No custom Date field, use createdAt
    });

    console.log("➡️ Order saved inside DB:", order.orderId);

    // Send admin email notification (non-blocking — errors won't fail the order)
    console.log("➡️ Triggering sendOrderNotification...");
    sendOrderNotification(order).catch((err) =>
      console.error("❌ Email notification error (in controller):", err)
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's orders
const userOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all orders (Admin only)
const allOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  userOrder,
  allOrders,
  updateOrderStatus,
};
