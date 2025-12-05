import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email FROM users"
    );
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
