import pool from "../config/db";

export const removeExpiredTokens = async () => {
  try {
    await pool.query("DELETE FROM revoked_tokens WHERE expires_at < NOW()");
    // console.log("✅ Cleaned expired revoked tokens");
  } catch (err) {
    console.error("Failed to cleanup revoked tokens:", err);
  }
};
