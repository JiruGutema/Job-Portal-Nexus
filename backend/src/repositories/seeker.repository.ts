
// - Repositories handle raw DB access and mapping raw rows to model types.
// - Use parameterized queries to avoid SQL injection.
// - Upserts should set timestamps (`created_at`, `updated_at`) and return the stored row.
// - Avoid returning sensitive user fields here for public endpoints; 
// the service layer may fetch and include them for owner-only responses.


import pool from "../config/db";
import { JobSeekerProfile } from "../models/SeekerProfile.model";
import { splitSkills, joinSkills, mapTimestamps } from "../utils/profile.utils";

const mapRowToSeeker = (r: any): JobSeekerProfile => {
  return {
    id: r.user_id,
    user_id: r.user_id,
    skills: splitSkills(r.skills),
    education: r.education || undefined,
    experience: r.experience || undefined,
    resume_url: r.resume_url || undefined,
    // `name` is sourced from users.name via JOIN below. Email is returned
    // separately by the service for owner-only responses.
    name: r.name || undefined,
    ...mapTimestamps(r),
  };
};

export const fetchSeekerProfile = async (user_id: number) => {
  const res = await pool.query(
    `-- Owner fetch: include user email for the profile owner only
     SELECT jsp.*, u.name AS name, u.email AS user_email
     FROM job_seeker_profile jsp
     LEFT JOIN users u ON u.id = jsp.user_id
     WHERE jsp.user_id = $1`,
    [user_id]
  );
  if (!res.rows[0]) return null;
  return mapRowToSeeker(res.rows[0]);
};

// backward-compatible alias (old name)
export const getSeekerByUserId = fetchSeekerProfile;

// For public profile retrieval we accept the user's id
export const fetchSeekerProfileByUserId = async (id: number) => {
  const res = await pool.query(
    `-- Public fetch: only include the display name (no email)
     SELECT jsp.*, u.name AS name
     FROM job_seeker_profile jsp
     LEFT JOIN users u ON u.id = jsp.user_id
     WHERE jsp.user_id = $1`,
    [id]
  );
  if (!res.rows[0]) return null;
  return mapRowToSeeker(res.rows[0]);
};

// backward-compatible alias
export const getSeekerById = fetchSeekerProfileByUserId;

export const saveSeekerProfile = async (p: JobSeekerProfile) => {
  // Normalize skills to a comma-separated string for storage (DB uses TEXT)
  const skillsStr = joinSkills(p.skills);

  await pool.query(
    `INSERT INTO job_seeker_profile (user_id, skills, education, experience, resume_url, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5, now(), now())
     ON CONFLICT (user_id) DO UPDATE SET
       skills = EXCLUDED.skills,
       education = EXCLUDED.education,
       experience = EXCLUDED.experience,
       resume_url = EXCLUDED.resume_url,
       updated_at = now()`,
    [p.user_id, skillsStr, p.education || null, p.experience || null, p.resume_url || null]
  );

  // Re-fetch the profile joined with user info so we return name (email is
  // provided only to the owner by the service layer).
  return await fetchSeekerProfileByUserId(p.user_id);
};

// backward-compatible alias
export const upsertSeeker = saveSeekerProfile;