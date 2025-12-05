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

app.use(cors({
  origin: "https://white-ocean-00157311e.3.azurestaticapps.net/",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/email", emailTestRoutes);
app.use("/api/users", userRoutes);

// health check route
app.get("/api/health", async (_, res) => {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS ok");
    res.json({ status: "ok", db: rows[0].ok === 2 });
  } catch (err) {
    res.status(500).json({ status: "fail", error: err.message });
  }
});

// main tasks route
app.use("/api/tasks", taskRoutes);

// azure requirement
const PORT = process.env.PORT || 4000;

// azure health route
app.get("/", (req, res) => {
  res.send("TeamTask API Running");
});

app.listen(PORT, () => 
  console.log(`✅ Server running on port ${PORT}`)
);
