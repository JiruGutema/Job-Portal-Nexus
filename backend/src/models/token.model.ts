import pool from "../config/db";

export const revokeToken = async (
  token: string,
  expires_at: Date
): Promise<void> => {
  const result = await pool.query(
    `INSERT INTO revoked_tokens (token, expires_at) VALUES ($1, $2) RETURNING *`,
    [token, expires_at]
  );
};

export const isTokenRevoked = async (token: string): Promise<boolean> => {
  const result = await pool.query(
    `SELECT * FROM revoked_tokens WHERE token = $1`,
    [token]
  );
  return result.rows.length > 0;
};
