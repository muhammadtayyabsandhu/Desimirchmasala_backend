const express = require("express");
const {
  isAuthenticated,
  isAdmin,
} = require("../middlewares/isAuthenticated.js");
const {
  placeOrder,
  userOrder,
  allOrders,
  updateOrderStatus,
} = require("../controller/orderController.js");

const router = express.Router();

router.route("/place_order").post(isAuthenticated, placeOrder);
router.route("/").get(isAuthenticated, userOrder);
router.route("/all_orders").get(isAdmin, isAuthenticated, allOrders);
router
  .route("/update_status/:id")
  .put(isAdmin, isAuthenticated, updateOrderStatus);

module.exports = router;
