const mongoose = require("mongoose");
const User = require("../models/user_model");
const ForgotPassword = require("../models/forgotpw_model");
const sendEmail = require("../utils/mailer");
const crypto = require("crypto");

async function createUser(req, res) {
  try {
    const { username, password, email } = req.body;

    const newUser = new User({
      username,
      password,
      email,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the password with the password stored in the database
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Successful login
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = generateResetToken();

    function generateResetToken() {
      const token = crypto.randomBytes(32).toString("hex");
      return token;
    }

    const forgotPasswordEntry = new ForgotPassword({
      resetToken,
      tokenExpired: false,
      user: new mongoose.Types.ObjectId(user._id),
    });

    await forgotPasswordEntry.save();

    sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    res
      .status(500)
      .json({ message: "Failed to process forgot password request", error });
  }
}

async function resetPassword(req, res) {
  try {
    const { resetToken } = req.params;

    const forgotPasswordEntry = await ForgotPassword.findOne({ resetToken });

    if (!forgotPasswordEntry || forgotPasswordEntry.tokenExpired) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    res.status(200).json({ message: "Reset password form" });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({ message: "Failed to verify reset token", error });
  }
}

async function updatePassword(req, res) {
  try {
    const { resetToken, password, confirmPassword } = req.body;

    const forgotPasswordEntry = await ForgotPassword.findOne({ resetToken });

    if (!forgotPasswordEntry || forgotPasswordEntry.tokenExpired) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(forgotPasswordEntry.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's password
    user.password = password;
    await user.save();

    // Mark the reset token as expired
    forgotPasswordEntry.tokenExpired = true;
    await forgotPasswordEntry.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Failed to update password", error });
  }
}

async function sendPasswordResetEmail(email, resetToken) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    text: `Please click on the following link to reset your password: http://localhost:3000/VerifyReset/${resetToken}`,
  };

  await sendEmail(mailOptions);
}

module.exports = {
  createUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updatePassword,
};
