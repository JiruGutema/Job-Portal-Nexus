import express from "express";

const app = express();
app.use(express.json());

// Import routes here 
app.get("/", (req, res) => {
  res.send("🚀 Job Portal Backend is running!");
});

export default app;
