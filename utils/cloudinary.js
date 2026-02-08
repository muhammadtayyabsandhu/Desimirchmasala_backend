const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();

// Cloudinary config
cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_NAME,
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }], // optional resize
  },
});

// Upload function for manual uploads
const uploadMedia = async (filePath) => {
  try {
    if (!filePath) throw new Error("File path is missing!");
    const uploadResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("Cloudinary Response:", uploadResponse); // ✅ check the output
    return uploadResponse;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message); // detailed error
    throw error; // throw to catch in controller
  }
};

// Multer upload middleware
const upload = multer({ storage });

module.exports = { uploadMedia, upload };
