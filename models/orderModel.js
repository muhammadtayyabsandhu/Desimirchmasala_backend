const mongoose = require("mongoose");

const orderModel = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: String, unique: true },
    paymentId: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: Number, required: true },
    mobile: { type: Number, required: true },
    products: [
      {
        productId: { type: String, required: true },
        title: { type: String },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        new_price: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true },
    Date: { type: String, },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderModel);
module.exports = Order;
