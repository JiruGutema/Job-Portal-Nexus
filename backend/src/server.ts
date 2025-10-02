import app from "./app";
import pool from "./config/db";
import { setupSwagger } from "./swagger/swagger";

const PORT = process.env.PORT || 7777;

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
  // Mount swagger UI and log the docs link
  try {
    setupSwagger(app);
    console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
  } catch (err) {
    console.warn("⚠️ Could not mount Swagger UI:", err);
  }
});