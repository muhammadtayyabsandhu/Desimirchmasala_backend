const express = require("express");
const {
  signup,
  login,
  logout,
  userProfile,
  updateProfile,
  allUsers,
  updateUserRole,
  deleteUser,
  forgetPassword,
  VerifyOtp,
  getOtpTime,
  updatePassword,
} = require("../controller/userController.js");
const {
  isAuthenticated,
  isAdmin,
} = require("../middlewares/isAuthenticated.js");
const { upload } = require("../utils/cloudinary.js");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/profile").get(isAuthenticated, userProfile);
router
  .route("/update")
  .put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.route("/all_users").get(isAdmin, isAuthenticated, allUsers);
router.route("/:id").put(isAdmin, isAuthenticated, updateUserRole);
router.route("/delete/:id").delete(isAdmin, isAuthenticated, deleteUser);
router.route("/forget/password").post(forgetPassword);
router.route("/otp/verify").post(VerifyOtp);
router.route("/otp/time").post(getOtpTime);
router.route("/update/password").post(updatePassword);

module.exports = router;
