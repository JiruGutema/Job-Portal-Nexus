import pool from "../config/db";
import {
  Application,
  ApplyToJobData,
  UpdateApplicationStatus,
} from "../models/Application";

export class ApplicationRepository {
  // Apply to a job
  async applyToJob(applicationData: ApplyToJobData): Promise<Application> {
    const { job_id, seeker_id } = applicationData;

    const result = await pool.query(
      `INSERT INTO applications (job_id, seeker_id)
       VALUES ($1, $2)
       RETURNING *`,
      [job_id, seeker_id]
    );

    return result.rows[0];
  }

  // Check if user already applied to job
  async checkExistingApplication(
    jobId: number,
    seekerId: number
  ): Promise<Application | null> {
    const result = await pool.query(
      "SELECT * FROM applications WHERE job_id = $1 AND seeker_id = $2",
      [jobId, seekerId]
    );

    return result.rows[0] || null;
  }

  // Get applications for a specific job
  async getApplicationsForJob(jobId: number): Promise<Application[]> {
    const result = await pool.query(
      "SELECT * FROM applications WHERE job_id = $1 ORDER BY created_at DESC",
      [jobId]
    );

    return result.rows;
  }

  // Get applications for a specific job seeker
  async getApplicationsForSeeker(seekerId: number): Promise<Application[]> {
    const result = await pool.query(
      "SELECT * FROM applications WHERE seeker_id = $1 ORDER BY created_at DESC",
      [seekerId]
    );

    return result.rows;
  }
  // Check if employer owns the job by job ID (for getApplicationsForJob)
  async checkEmployerJobOwnershipByJobId(
    jobId: number,
    employerId: number
  ): Promise<boolean> {
    const result = await pool.query(
      "SELECT id FROM jobs WHERE id = $1 AND employer_id = $2",
      [jobId, employerId]
    );

    return result.rows.length > 0;
  }

  // Check if employer owns the job for this application
  async checkEmployerJobOwnership(
    applicationId: number,
    employerId: number
  ): Promise<boolean> {
    const result = await pool.query(
      `SELECT j.id FROM applications a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.id = $1 AND j.employer_id = $2`,
      [applicationId, employerId]
    );

    return result.rows.length > 0;
  }

  // Get application with job details for ownership verification
  async getApplicationWithJobDetails(applicationId: number): Promise<any> {
    const result = await pool.query(
      `SELECT a.*, j.employer_id, j.title as job_title
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.id = $1`,
      [applicationId]
    );

    return result.rows[0];
  }

  // Update application status
  async updateApplicationStatus(
    applicationId: number,
    statusData: UpdateApplicationStatus
  ): Promise<Application | null> {
    const { status } = statusData;

    const result = await pool.query(
      `UPDATE applications 
       SET status = $1 
       WHERE id = $2
       RETURNING *`,
      [status, applicationId]
    );

    return result.rows[0] || null;
  }

  // Withdraw application
  async withdrawApplication(
    applicationId: number,
    seekerId: number
  ): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM applications WHERE id = $1 AND seeker_id = $2",
      [applicationId, seekerId]
    );

    return !!result.rowCount;
  }

  // Get application by ID
  async getApplicationById(applicationId: number): Promise<Application | null> {
    const result = await pool.query(
      "SELECT * FROM applications WHERE id = $1",
      [applicationId]
    );

    return result.rows[0] || null;
  }
}
