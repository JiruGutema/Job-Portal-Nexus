import {
  fetchSeekerProfile,
  saveSeekerProfile,
  fetchSeekerProfileByUserId,
} from "../repositories/seeker.repository";
import {
  fetchEmployerProfile,
  saveEmployerProfile,
  fetchEmployerProfileByUserId,
} from "../repositories/employer.repository";
import pool from "../config/db";
import { ProfileWithUser, UserInfo } from "../models/ProfileWithUser";
import { JobSeekerProfile } from "../models/SeekerProfile.model";
import { EmployerProfile } from "../models/EmployerProfile.model";

export const getOwnProfile = async (
  user: { id: number; role: string }
): Promise<ProfileWithUser<JobSeekerProfile | EmployerProfile> | null> => {
  if (user.role === "seeker") {
    const profile = await fetchSeekerProfile(user.id);
    if (!profile) return null;
    // include email for owner
    const res = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [user.id]);
    const userInfo: UserInfo = res.rows[0] ? { id: res.rows[0].id, name: res.rows[0].name, email: res.rows[0].email } : undefined as any;
    return { profile, user: userInfo };
  }
  if (user.role === "employer") {
    const profile = await fetchEmployerProfile(user.id);
    if (!profile) return null;
    const res = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [user.id]);
    const userInfo: UserInfo = res.rows[0] ? { id: res.rows[0].id, name: res.rows[0].name, email: res.rows[0].email } : undefined as any;
    return { profile, user: userInfo };
  }
  return null;
};

export const updateSeekerProfile = async (user_id: number, data: any) => {
  const profile = await saveSeekerProfile({ user_id, ...data });
  return profile;
};

export const updateEmployerProfile = async (user_id: number, data: any) => {
  const profile = await saveEmployerProfile({ user_id, ...data });
  return profile;
};

export const getPublicProfileById = async (
  id: number
): Promise<{ role: string | null; profile: JobSeekerProfile | EmployerProfile } | null> => {
  // First try seeker_profiles with id (public fetch — no email)
  const seeker = await fetchSeekerProfileByUserId(id);
  if (seeker) {
    return { role: "seeker", profile: seeker };
  }
  const employer = await fetchEmployerProfileByUserId(id);
  if (employer) {
    return { role: "employer", profile: employer };
  }
  // fallback: try user table (public view — exclude email?)
  const res = await pool.query("SELECT id, name, role, created_at FROM users WHERE id = $1", [id]);
  if (res.rows[0]) return { role: res.rows[0].role || null, profile: res.rows[0] };
  return null;
};