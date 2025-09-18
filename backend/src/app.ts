import express from "express";
import pool from "./config/db";
import userRoutes from "./routes/user.routes";

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

app.use("/api", userRoutes);
app.use("/api", userRoutes);

export default app;
