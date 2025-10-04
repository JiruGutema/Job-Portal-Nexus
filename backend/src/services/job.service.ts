import { JobRepository } from '../repositories/job.repository';
import { Job, JobFilters } from '../models/Job';

export class JobService {
  private jobRepository: JobRepository;

  constructor() {
    this.jobRepository = new JobRepository();
  }

  // Validate job data before creating
  private validateJobData({ title, description }: Partial<Job>): string[] {
    const errors: string[] = [];

    if (!title || title.trim().length === 0) {
      errors.push('Job title is required');
    }

    if (!description || description.trim().length === 0) {
      errors.push('Job description is required');
    }

    if (title && title.length > 100) {
      errors.push('Job title must be less than 100 characters');
    }

    if (description && description.length > 2000) {
      errors.push('Job description must be less than 2000 characters');
    }

    return errors;
  }

  // Create a new job with validation
  async createJob(employerId: number, jobData: Partial<Job>): Promise<Job> {
    const {
      title,
      description,
      requirements,
      location,
      salary_range,
      job_type = 'full-time'
    } = jobData;

    // Validate the job data
    const errors = this.validateJobData({ title, description });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Prepare complete job data
    const completeJobData: Job = {
      employer_id: employerId,
      title: title!.trim(),
      description: description!.trim(),
      requirements: requirements?.trim(),
      location: location?.trim(),
      salary_range,
      job_type
    };

    // Save to database
    return await this.jobRepository.createJob(completeJobData);
  }

  // Get all jobs with filters
  async getAllJobs(filters: JobFilters): Promise<Job[]> {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      job_type
    } = filters;

    // Set safe filters with defaults
    const safeFilters: JobFilters = {
      page,
      limit,
      search,
      location,
      job_type
    };

    return await this.jobRepository.getAllJobs(safeFilters);
  }

  // Get single job by ID
  async getJobById(jobId: number): Promise<Job | null> {
    if (!jobId || jobId <= 0) {
      throw new Error('Valid job ID is required');
    }

    return await this.jobRepository.getJobById(jobId);
  }

  // Get jobs for specific employer
  async getJobsByEmployer(employerId: number): Promise<Job[]> {
    if (!employerId || employerId <= 0) {
      throw new Error('Valid employer ID is required');
    }

    return await this.jobRepository.getJobsByEmployer(employerId);
  }

  // Update job with validation and ownership check
  async updateJob(jobId: number, employerId: number, updates: Partial<Job>): Promise<Job | null> {
    const {
      title,
      description,
      requirements,
      location,
      salary_range,
      job_type
    } = updates;

    if (!jobId || jobId <= 0) {
      throw new Error('Valid job ID is required');
    }

    // Check if job exists and belongs to employer
    const existingJob = await this.jobRepository.getJobById(jobId);
    if (!existingJob) {
      throw new Error('Job not found');
    }

    if (existingJob.employer_id !== employerId) {
      throw new Error('You can only update your own jobs');
    }

    // Validate updates if provided
    if (title || description) {
      const validationData = {
        title: title || existingJob.title,
        description: description || existingJob.description
      };
      
      const errors = this.validateJobData(validationData);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
    }

    // Prepare updates with only provided fields
    const updatesToApply: Partial<Job> = {
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(requirements !== undefined && { requirements: requirements?.trim() }),
      ...(location !== undefined && { location: location?.trim() }),
      ...(salary_range !== undefined && { salary_range }),
      ...(job_type !== undefined && { job_type })
    };

    // Apply updates
    return await this.jobRepository.updateJob(jobId, employerId, updatesToApply);
  }

  // Delete job with ownership check
  async deleteJob(jobId: number, employerId: number): Promise<boolean> {
    if (!jobId || jobId <= 0) {
      throw new Error('Valid job ID is required');
    }

    // Check if job exists and belongs to employer
    const existingJob = await this.jobRepository.getJobById(jobId);
    if (!existingJob) {
      throw new Error('Job not found');
    }

    if (existingJob.employer_id !== employerId) {
      throw new Error('You can only delete your own jobs');
    }

    return await this.jobRepository.deleteJob(jobId, employerId);
  }
}