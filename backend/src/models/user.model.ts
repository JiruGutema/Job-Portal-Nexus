/* import pool from "../config/db";
 */
export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: "seeker" | "employer" | "admin";
  created_at: Date;
}
