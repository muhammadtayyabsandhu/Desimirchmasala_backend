const User = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken.js");
const { uploadMedia } = require("../utils/cloudinary.js");
const sendMail = require("../utils/sendMail.js");
const crypto = require("crypto");
//User Signup
const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    return res
      .status(201)
      .json({ success: true, message: "User created successfully", newUser });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while creating user`,
    });
  }
};

//User Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    generateToken(res, user, `Welcome back ${user.firstname}`);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while login attempt`,
    });
  }
};

//User Logout
const logout = async (_, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", {
        httpOnly: true,
        maxAge: 0,
        sameSite: "None",
        secure: true
      })
      .json({
        success: true,
        message: "User logged out successfully",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while logout attempt`,
    });
  }
};

//Get All Users
const allUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (users) {
      res.status(200).json({
        success: true,
        users,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while getting users`,
    });
  }
};

//Single User
const userProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while getting user`,
    });
  }
};

//Update User Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    const { firstname, lastname } = req.body;
    const profilePhoto = req.file;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const cloudResponse = await uploadMedia(profilePhoto.path);
    const photoUrl = cloudResponse.secure_url;
    const updatedData = { firstname, lastname, photoUrl };
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");
    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while updating profile`,
    });
  }
};

//Update User Role
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.role = req.body.role || user.role;
    await user.save();
    res.json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while updating user role`,
    });
  }
};

//Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await user.deleteOne();
    res.status(201).json({
      success: true,
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error : ${error} while deleting user`,
    });
  }
};

//Forget Password
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.otp.otp &&
      new Date(user.otp.sendTime).getTime() > new Date().getTime()
    ) {
      return res.status(400).json({
        success: false,
        message: `OTP is already sent, please wait until ${new Date(
          user.otp.sendTime
        ).toLocaleTimeString()}`,
      });
    }
    const otp = Math.floor(Math.random() * 90000) + 100000;
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");

    user.otp.otp = otp;
    user.otp.sendTime = new Date().getTime() + 1 * 60 * 1000;
    user.otp.resetPasswordToken = resetPasswordToken;
    await user.save();
    sendMail(otp, email);

    res.status(200).json({
      success: true,
      message: "OTP sent to your provided email address",
      resetPasswordToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error: ${error}`,
    });
  }
};

//Verify OTP
const VerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await User.findOne({ "otp.otp": otp });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (new Date(user.otp.sendTime).getTime() < new Date().getTime()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    user.otp.otp = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error: ${error}`,
    });
  }
};

//Otp Time
const getOtpTime = async (req, res) => {
  try {
    const { resetPasswordToken } = req.body;
    const user = await User.findOne({
      "otp.resetPasswordToken": resetPasswordToken,
    }).select("otp");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    res.status(200).json({
      success: true,
      message: "success",
      sendTime: user.otp.sendTime,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error: ${error}`,
    });
  }
};

//Update Password
const updatePassword = async (req, res) => {
  try {
    const { resetPasswordToken, password } = req.body;
    const user = await User.findOne({
      "otp.resetPasswordToken": resetPasswordToken,
    });
    if (!user || !user.otp || !user.otp.sendTime) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or session expired",
      });
    }
    if (new Date(user.otp.sendTime).getTime() + 5 * 60 * 1000 < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired, please request a new one",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.otp = {};
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error: ${error}`,
    });
  }
};

module.exports = {
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
};
