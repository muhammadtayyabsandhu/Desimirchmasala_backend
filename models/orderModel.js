const mongoose = require("mongoose");

const orderModel = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: String, unique: true },
    paymentId: { type: String },

    // Shipping Information
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    colony: { type: String, required: true },
    buildingNo: { type: String, required: true },


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
    paymentMethod: {
      type: String,
      enum: ["COD", "Online Payment"],
      default: "COD",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderModel);
module.exports = Order;
