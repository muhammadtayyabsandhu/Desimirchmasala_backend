const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({});

const sendMail = (otp, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "GMAIL",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "reset password OTP",
      html: `<div>Your password reset OTP is
      <br />
      ${otp}</div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error("Failed to send email");
      } else {
        console.log("Email sent", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMail;
