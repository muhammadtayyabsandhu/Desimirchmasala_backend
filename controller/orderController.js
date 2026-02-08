const Stripe = require("stripe");
const Order = require("../models/orderModel.js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//Create Order
const placeOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { address, city, state, zip, mobile, products, totalAmount } =
      req.body;
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.title,
          description: `Quantity: ${product.quantity}`,
          images: [product.image],
        },
        unit_amount: Math.round(product.new_price * 100),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.ORDER_SUCCESS_URL}`,
    });
    const order = new Order({
      userId,
      orderId: session.id,
      paymentId: session.payment_intent,
      address,
      city,
      state,
      zip,
      mobile,
      products,
      totalAmount,
      Date: new Date(),
      status: "pending",
    });
    await order.save();
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error ${error} while creating order`,
    });
  }
};

//get user order

const userOrder = async (req, res) => {
  try {
    const userId = req.id;
    const orders = await Order.find({ userId });
    res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error ${error} while getting order`,
    });
  }
};

// get all orders
const allOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    if (orders) {
      res.status(201).json({
        success: true,
        orders,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error ${error} while getting orders`,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while updating order status`,
    });
  }
};

module.exports = { placeOrder, userOrder, allOrders , updateOrderStatus };
