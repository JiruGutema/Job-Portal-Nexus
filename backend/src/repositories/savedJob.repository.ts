import pool from '../config/db';
import { SavedJob, SaveJobData, RemoveSavedJobData } from '../models/SavedJobs';

export class SavedJobRepository {
  
  // Save a job for later
  async saveJob(saveData: SaveJobData): Promise<SavedJob> {
    const { job_id, seeker_id } = saveData;

    const result = await pool.query(
      `INSERT INTO saved_jobs (job_id, seeker_id)
       VALUES ($1, $2)
       RETURNING *`,
      [job_id, seeker_id]
    );
    
    return result.rows[0];
  }

  // Check if job is already saved
  async checkJobAlreadySaved(jobId: number, seekerId: number): Promise<SavedJob | null> {
    const result = await pool.query(
      'SELECT * FROM saved_jobs WHERE job_id = $1 AND seeker_id = $2',
      [jobId, seekerId]
    );
    
    return result.rows[0] || null;
  }

  // Get all saved jobs for a seeker
  async getSavedJobsBySeeker(seekerId: number): Promise<SavedJob[]> {
    const result = await pool.query(
      `SELECT sj.*, j.title, j.description, j.requirements, j.location, j.job_type, j.salary_range
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       WHERE sj.seeker_id = $1
       ORDER BY sj.created_at DESC`,
      [seekerId]
    );
    
    return result.rows;
  }

  // Remove job from saved list
  async removeSavedJob(removeData: RemoveSavedJobData): Promise<boolean> {
    const { job_id, seeker_id } = removeData;

    const result = await pool.query(
      'DELETE FROM saved_jobs WHERE job_id = $1 AND seeker_id = $2',
      [job_id, seeker_id]
    );
    
    return !!result.rowCount;
  }

  // Get saved job by ID and seeker
  async getSavedJobById(jobId: number, seekerId: number): Promise<SavedJob | null> {
    const result = await pool.query(
      'SELECT * FROM saved_jobs WHERE job_id = $1 AND seeker_id = $2',
      [jobId, seekerId]
    );
    
    return result.rows[0] || null;
  }
}