const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      required: true,
      type: String,
    },
    lastname: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      required: true,
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    otp: {
      otp: {
        type: String,
      },
      sendTime: {
        type: Number,
      },
      resetPasswordToken: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
