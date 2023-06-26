const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");

// Route for creating a user
router.post("/create-user", userController.createUser);

// Route for user login
router.post("/login", userController.loginUser);

// Route for initiating the password reset process
router.post("/forgot-password", userController.forgotPassword);

// Route for resetting the password
router.get("/verifyReset/:resetToken", userController.resetPassword);

// Route for updating the password
router.post("/reset-password", userController.updatePassword);

module.exports = router;
