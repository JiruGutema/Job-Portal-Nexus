import express from "express";
import pool from "./config/db";
import userRoutes from "./routes/user.routes";
import profileRoutes from "./routes/profile.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from './routes/application.routes';
import savedJobsRoutes from './routes/savedJobs.routes';
import notificationRoutes from './routes/notification.route';
const app = express();
app.use(express.json());

// Import routes here
app.get("/", (req, res) => {
  res.send("🚀 Job Portal Backend is running!");
});
app.get("/current-db", async (req, res) => {
  let result = await pool.query("SELECT current_database()");
  res.send(result);
});

app.use("/notifications", notificationRoutes);
app.use("/api/auth", userRoutes);

// Mount user routes and profile routes at both /api and root for backwards compatibility
//app.use("/api", userRoutes);
//app.use("/", userRoutes);
app.use("/api", profileRoutes);
app.use("/", profileRoutes);
app.use("/api", jobRoutes);
export default app;
