import express from "express";
import pool from "../db.js";

const router = express.Router();

// creating a task
router.post("/", async (req, res) => {
  try {
    const { title, description, due_date, created_by, assigned_to } = req.body;

    if (!title || !created_by || !assigned_to)
      return res.status(400).json({ message: "Missing required fields" });

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, due_date, created_by, assigned_to)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, due_date, created_by, assigned_to]
    );

    res.status(201).json({
      message: "Task created successfully",
      task_id: result.insertId
    });
  } catch (err) {
    console.error("Task creation error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// get tasks for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [tasks] = await pool.query(
      `SELECT * FROM tasks WHERE created_by = ? OR assigned_to = ?`,
      [userId, userId]
    );

    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// update a task
router.put("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, due_date, status } = req.body;

    const [result] = await pool.query(
      `UPDATE tasks SET title=?, description=?, due_date=?, status=? WHERE id=?`,
      [title, description, due_date, status, taskId]
    );

    res.json({ message: "Task updated successfully" });
  } catch (err) {
    console.error("Update task error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// delete a task
router.delete("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    await pool.query(`DELETE FROM tasks WHERE id=?`, [taskId]);

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete task error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// update ONLY status
router.patch("/:taskId/status", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await pool.query(
      `UPDATE tasks SET status=? WHERE id=?`,
      [status, taskId]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("Status update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
