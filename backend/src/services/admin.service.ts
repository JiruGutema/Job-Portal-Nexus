import pool from "../config/db";

// Admin service: list users/jobs/applications and perform soft-ban / soft-remove
export const getAllUsersService = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at, updated_at, COALESCE(banned, false) as banned FROM users ORDER BY created_at DESC`
  );
  return result.rows;
};

export const getAllJobsService = async () => {
  const result = await pool.query(
    `SELECT * FROM jobs ORDER BY created_at DESC`
  );
  return result.rows;
};

export const getAllApplicationsService = async () => {
  const result = await pool.query(
    `SELECT * FROM applications ORDER BY created_at DESC`
  );
  return result.rows;
};

// Soft-ban a user (set banned = true)
export const banUserService = async (userId: number) => {
  const result = await pool.query(
    `UPDATE users SET banned = true, updated_at = NOW() WHERE id = $1 RETURNING id, name, email, role, banned`,
    [userId]
  );
  if (result.rows.length === 0) throw new Error("User not found");
  return result.rows[0];
};

// Soft-remove a job (set removed_by_admin = true)
export const removeJobService = async (jobId: number) => {
  const result = await pool.query(
    `UPDATE jobs SET removed_by_admin = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [jobId]
  );
  if (result.rows.length === 0) throw new Error("Job not found");
  return result.rows[0];
};

// Soft-delete user route (alias for ban)
export const deleteUserService = async (userId: number) => {
  return await banUserService(userId);
};

export default {
  getAllUsersService,
  getAllJobsService,
  getAllApplicationsService,
  banUserService,
  removeJobService,
  deleteUserService,
};
