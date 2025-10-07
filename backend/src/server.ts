import app from "./app";
import pool from "./config/db";
import { setupSwagger } from "./swagger/swagger";

const PORT = process.env.PORT || 7777;

/* pool.connect();
 */ // Event: on successful connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});
// Swagger UI
setupSwagger(app);

// Optional: test the connection immediately
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Postgres Time:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL:", err);
  }
})();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
});
