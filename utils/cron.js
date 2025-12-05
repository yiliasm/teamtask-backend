import cron from "node-cron";
import pool from "../db.js";
import sendEmail from "./mailer.js";

// run every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Daily task reminder check...");

  try {
    // notify for tasks that are 1 or 3 days from deadline
    const [tasks] = await pool.query(
      `SELECT 
        tasks.id,
        tasks.title,
        tasks.description,
        tasks.due_date,
        users.email AS assigned_email,
        users.username AS assigned_username
       FROM tasks
       INNER JOIN users 
         ON tasks.assigned_to = users.id
       WHERE 
         DATE(due_date) = DATE(DATE_ADD(NOW(), INTERVAL 3 DAY))
         OR
         DATE(due_date) = DATE(DATE_ADD(NOW(), INTERVAL 1 DAY));`
    );

    console.log(`Found ${tasks.length} tasks with upcoming deadlines.`);

    for (const task of tasks) {
      let daysLeft =
        Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24));

      let subject =
        daysLeft === 3
          ? "TeamTask Reminder: Task due in 3 days"
          : "TeamTask Reminder: Task due tomorrow";

      let message = `
        <h2>Reminder from TeamTask</h2>
        <p>Hello ${task.assigned_username},</p>
        <p>This is a reminder that your task is due soon.</p>
        <p><strong>${task.title}</strong></p>
        <p>${task.description || ""}</p>
        <p>Due Date: <strong>${task.due_date}</strong></p>
        <br/>
        <p>Please make sure to complete it on time.</p>
      `;

      // send the email
      await sendEmail(task.assigned_email, subject, message);

      console.log(`Reminder sent to ${task.assigned_email}`);
    }
  } catch (err) {
    console.error("Error running:", err);
  }
});
