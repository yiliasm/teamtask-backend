import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// post register new user
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ message: "Missing required fields" });

    // check for duplicate accounts
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existing.length)
      return res.status(409).json({ message: "Email or username already exists" });

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // insert new user
    const [result] = await pool.query(
      "INSERT INTO users (email, username, password_hash) VALUES (?,?,?)",
      [email, username, hash]
    );

    // create jsonwt
    const token = jwt.sign(
      { id: result.insertId, email, username },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(201).json({
      message: "Registration successful",
      user: { id: result.insertId, email, username },
      token
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// post login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    // check if the user already exists
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ message: "User not found" });

    const user = rows[0];

    // check password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    // create jsonwt
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, username: user.username },
      token
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
