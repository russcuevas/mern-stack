const nodemailer = require("nodemailer");

async function sendEmail(options) {
  try {
    // Create a transporter using your email service provider settings
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send the email
    await transporter.sendMail(options);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;
