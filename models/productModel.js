const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    titleEnglish: {
      type: String,
      default: "",
    },
    brand_name: {
      type: String,
    },
    tags: {
      type: String,
      enum: ["Trending", "TopProducts", "NewArrival"],
      default: undefined,
    },
    category: {
      type: String,
      required: true,
    },
    new_price: {
      type: Number,
    },
    old_price: {
      type: Number,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
