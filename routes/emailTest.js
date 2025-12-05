import express from "express";
import transporter from "../utils/mailer.js";

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: `"TeamTask" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email!",
      text: "Your TeamTask email system works!",
    });

    console.log("Message sent:", info.messageId);
    res.json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Email failed to send", error: err.message });
  }
});

export default router;
