import pool from "../config/db";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
// create or add new user
export const addUser = async (user: User): Promise<User> => {
  const { name, email, password, role } = user;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new Error("Email already in use");
  }
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];
  if (!user) {
    throw new Error("Invalid email or password");
  }
  //2️⃣ Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};
async function findByEmail(email: string): Promise<User | null> {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  return null;
}
