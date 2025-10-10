import express from "express";
import pool from "./config/db";
import userRoutes from "./routes/user.routes";
import profileRoutes from "./routes/profile.routes";
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import savedJobsRoutes from './routes/savedJobs.routes';
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

// Mount routes at both /api and root for backwards compatibility
// Mount specific routes BEFORE general routes
app.use('/', savedJobsRoutes);  // Saved jobs routes FIRST
app.use('/', jobRoutes);        // General job routes SECOND  
app.use('/', applicationRoutes);
app.use('/', userRoutes);
app.use('/', profileRoutes);

app.use("/api", savedJobsRoutes);  // FIRST
app.use("/api", jobRoutes);        // SECOND
app.use("/api", applicationRoutes);
app.use("/api", userRoutes);
app.use("/api", profileRoutes);

export default app;