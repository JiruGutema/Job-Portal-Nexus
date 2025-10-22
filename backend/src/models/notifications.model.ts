import pool from "../config/db";

export interface Notification {
  id?: number;
  user_id: number;
  message: string;
  status?: "read" | "unread";
  created_at?: Date;
  updated_at?: Date;
}

export const NotificationModel = {
  async create(data: Notification) {
    const { user_id, message } = data;
    const result = await pool.query(
      `INSERT INTO notifications (user_id, message, status)
       VALUES ($1, $2, 'unread')
       RETURNING *`,
      [user_id, message]
    );
    return result.rows[0];
  },

  async getByUserId(userId: number) {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async markAsRead(id: number) {
    const result = await pool.query(
      `UPDATE notifications SET status = 'read' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async delete(id: number) {
    await pool.query(`DELETE FROM notifications WHERE id = $1`, [id]);
  },
};
