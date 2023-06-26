const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema({
  resetToken: { type: String, required: true },
  tokenExpired: { type: Boolean, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema);

module.exports = ForgotPassword;
