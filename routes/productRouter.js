const express = require("express");
const {
  createProduct,
  getProducts,
  deleteProduct,
} = require("../controller/productController.js");
const {
  isAdmin,
  isAuthenticated,
} = require("../middlewares/isAuthenticated.js");
const { upload } = require("../utils/cloudinary.js");

const router = express.Router();

router
.route("/create")
.post(isAdmin, isAuthenticated, upload.single("image"), createProduct);
router.route("/").get(getProducts);
router.route("/:id").delete(isAuthenticated ,isAdmin,  deleteProduct);

module.exports = router;
