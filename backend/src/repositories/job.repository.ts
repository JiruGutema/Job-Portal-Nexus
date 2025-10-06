import pool from '../config/db';
import { Job, JobFilters } from '../models/Job';

export class JobRepository {
  
  async createJob(jobData: Job): Promise<Job> {
    const {
      employer_id,
      title,
      description,
      requirements,
      location,
      salary_range,
      job_type
    } = jobData;

    const result = await pool.query(
      `INSERT INTO jobs (employer_id, title, description, requirements, location, salary_range, job_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        employer_id,    // $1
        title,          // $2
        description,    // $3
        requirements,   // $4 
        location,       // $5
        salary_range,   // $6
        job_type        // $7
      ]
    );
    
    return result.rows[0];
  }

// async getAllJobs(filters: JobFilters = {}): Promise<Job[]> {
//   const {
//     search,
//     location,
//     job_type,
//     page = 1,
//     limit = 10
//   } = filters;

//   let query = 'SELECT * FROM jobs WHERE 1=1';
//   const values: any[] = [];
//   let paramCount = 0;

//   if (search) {
//     paramCount++;
//     query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
//     values.push(`%${search}%`);
//   }

//   if (location) {
//     paramCount++;
//     query += ` AND location ILIKE $${paramCount}`;
//     values.push(`%${location}%`);
//   }

//   if (job_type) {
//     paramCount++;
//     query += ` AND job_type = $${paramCount}`;
//     values.push(job_type);
//   }

//   // Add ORDER BY before LIMIT/OFFSET
//   query += ' ORDER BY created_at DESC';

//   // Add pagination after ORDER BY
//   const offset = (page - 1) * limit;
  
//   paramCount++;
//   query += ` LIMIT $${paramCount}`;
//   values.push(limit);
  
//   paramCount++;
//   query += ` OFFSET $${paramCount}`;
//   values.push(offset);

//   const result = await pool.query(query, values);
//   return result.rows;
// }

//   async getJobById(jobId: number): Promise<Job | null> {
//     const result = await pool.query(
//       'SELECT * FROM jobs WHERE id = $1',
//       [jobId]  // $1
//     );
//     return result.rows[0] || null;
//   }

async getAllJobs(filters: JobFilters = {}): Promise<Job[]> {
  const {
    search,
    location,
    job_type,
    page = 1,
    limit = 10
  } = filters;

  let query = 'SELECT * FROM jobs WHERE 1=1';
  const values: any[] = [];
  let paramCount = 0;

  // ✅ ENHANCED: Search in title, description, AND requirements
  if (search) {
    paramCount++;
    query += ` AND (
      title ILIKE $${paramCount} 
      OR description ILIKE $${paramCount} 
      OR requirements ILIKE $${paramCount}
    )`;
    values.push(`%${search}%`);
  }

  if (location) {
    paramCount++;
    query += ` AND location ILIKE $${paramCount}`;
    values.push(`%${location}%`);
  }

  if (job_type) {
    paramCount++;
    query += ` AND job_type = $${paramCount}`;
    values.push(job_type);
  }

  query += ' ORDER BY created_at DESC';

  const offset = (page - 1) * limit;
  
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  values.push(limit);
  
  paramCount++;
  query += ` OFFSET $${paramCount}`;
  values.push(offset);

  const result = await pool.query(query, values);
  return result.rows;
}
  async getJobById(jobId: number): Promise<Job | null> {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE id = $1',
      [jobId]  // $1
    );
    return result.rows[0] || null;
  }

  async getJobsByEmployer(employerId: number): Promise<Job[]> {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE employer_id = $1 ORDER BY created_at DESC',
      [employerId]  // $1
    );
    return result.rows;
  }

  async updateJob(jobId: number, employerId: number, updates: Partial<Job>): Promise<Job | null> {
    const {
      title,
      description,
      requirements,
      location,
      salary_range,
      job_type
    } = updates;

    const result = await pool.query(
      `UPDATE jobs 
       SET title = $1, description = $2, requirements = $3, location = $4, salary_range = $5, job_type = $6
       WHERE id = $7 AND employer_id = $8
       RETURNING *`,
      [
        title,          // $1
        description,    // $2
        requirements,   // $3
        location,       // $4
        salary_range,   // $5
        job_type,       // $6
        jobId,          // $7
        employerId      // $8
      ]
    );
    
    return result.rows[0] || null;
  }

  async deleteJob(jobId: number, employerId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND employer_id = $2',
      [
        jobId,      // $1
        employerId  // $2
      ]
    );
    
    return !!result.rowCount;
  }
}