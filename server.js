import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import "./utils/cron.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import userRoutes from "./routes/users.js";
import emailTestRoutes from "./routes/emailTest.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/email", emailTestRoutes);
app.use("/api/users", userRoutes);

// verify database connection
app.get("/api/health", async (_, res) => {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS ok");
    res.json({ status: "ok", db: rows[0].ok === 2 });
  } catch (err) {
    res.status(500).json({ status: "fail", error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.use("/api/tasks", taskRoutes);
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
