import { User } from "../models/user.model";
import pool from "../config/db";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
// create or add new user
export const addUser = async (user: User): Promise<User> => {
  const { name, email, password, role } = user;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};
