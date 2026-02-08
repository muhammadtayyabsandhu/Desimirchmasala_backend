const Product = require("../models/productModel.js");
const { uploadMedia } = require("../utils/cloudinary.js");
const striptags = require("striptags");
//Create Product
const createProduct = async (req, res) => {
  try {
    let {
      title,
      brand_name,
      tags,
      category,
      new_price,
      old_price,
      description,
    } = req.body;
    const cleanDescription = striptags(description);
    if (!tags) {
      tags = undefined;
    }
    const cloudResponse = await uploadMedia(req.file.path);
    const image = cloudResponse.secure_url;
    const product = await Product.create({
      title,
      brand_name,
      tags,
      category,
      new_price,
      old_price,
      description: cleanDescription,
      image,
    });
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error ${error} while creating product`,
    });
  }
};

//get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      res.status(404).json({
        success: false,
        message: "No products found",
      });
    }
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error ${error} while getting products`,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    await Product.findByIdAndDelete(id);
    res.status(201).json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error ${error} while deleting product`,
    });
  }
};
module.exports = { createProduct, getProducts, deleteProduct };
