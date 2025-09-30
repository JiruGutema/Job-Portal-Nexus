import pool from "../config/db";
import { EmployerProfile } from "../models/EmployerProfile.model";
import { mapTimestamps } from "../utils/profile.utils";

// Map a database row to the public EmployerProfile shape used by services/controllers.
// Note: queries below LEFT JOIN the `users` table and alias `u.name` as `name`.
// We expose `name` (sourced from users.name) on the returned profile objects.
const mapRowToEmployer = (r: any): EmployerProfile => {
  return {
    id: r.user_id,
    user_id: r.user_id,
    company_name: r.company_name || r.companyname || "",
    description: r.description || r.about || undefined,
    industry: r.industry || undefined,
    logo_url: r.logo_url || undefined,
  // `name` is sourced from users.name via JOIN below. Email is returned
  // separately by the service for owner-only responses.
  name: r.name || undefined,
    ...mapTimestamps(r),
  };
};

export const fetchEmployerProfile = async (user_id: number) => {
  const res = await pool.query(
    `-- Owner fetch: include user email for the profile owner only
     SELECT ep.*, u.name AS name, u.email AS user_email
     FROM employer_profile ep
     LEFT JOIN users u ON u.id = ep.user_id
     WHERE ep.user_id = $1`,
    [user_id]
  );
  if (!res.rows[0]) return null;
  return mapRowToEmployer(res.rows[0]);
};

// backward-compatible alias
export const getEmployerByUserId = fetchEmployerProfile;

export const fetchEmployerProfileByUserId = async (id: number) => {
  const res = await pool.query(
    `-- Public fetch: only include the display name (no email)
     SELECT ep.*, u.name AS name
     FROM employer_profile ep
     LEFT JOIN users u ON u.id = ep.user_id
     WHERE ep.user_id = $1`,
    [id]
  );
  if (!res.rows[0]) return null;
  return mapRowToEmployer(res.rows[0]);
};

// backward-compatible alias
export const getEmployerById = fetchEmployerProfileByUserId;

export const saveEmployerProfile = async (p: EmployerProfile) => {
  // Upsert: set created_at/updated_at on insert, and set updated_at on conflict.
  // We intentionally don't rely solely on DB defaults here so the repository works
  // even if the table lacks DEFAULT now() definitions. After the upsert we re-query
  // the joined view (employer_profile + users) so the returned object includes
  // the user's `name`/`email` fields (the INSERT ... RETURNING * would not include
  // the joined user columns).
  await pool.query(
    `INSERT INTO employer_profile (user_id, company_name, description, industry, logo_url, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5, now(), now())
     ON CONFLICT (user_id) DO UPDATE SET
       company_name = EXCLUDED.company_name,
       description = EXCLUDED.description,
       industry = EXCLUDED.industry,
       logo_url = EXCLUDED.logo_url,
       updated_at = now()`,
    [p.user_id, p.company_name || null, p.description || null, (p as any).industry || null, p.logo_url || null]
  );

  // Re-fetch the profile joined with user info so we return `name`.
  // Email is provided only to the owner by the service layer.
  return await fetchEmployerProfileByUserId(p.user_id);
};

// backward-compatible alias
export const upsertEmployer = saveEmployerProfile;