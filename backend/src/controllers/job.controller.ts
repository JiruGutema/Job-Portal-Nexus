import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  // Create a new job (Employer only)
  async createJob(req: AuthRequest, res: Response) {
    try {
      const { user } = req;
      const { 
        title, 
        description, 
        requirements, 
        location, 
        salary_range, 
        job_type 
      } = req.body;

      // Check if user is employer
      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          success: false,
          message: 'Only employers can create jobs'
        });
      }

      const jobData = {
        title,
        description,
        requirements,
        location,
        salary_range,
        job_type
      };

      const newJob = await this.jobService.createJob(user.id, jobData);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: newJob
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all jobs with filters (Public)
async getAllJobs(req: Request, res: Response) {
  try {
    const { 
      search, 
      location, 
      job_type, 
      page, 
      limit 
    } = req.query;

    const filters = {
      search: search as string,
      location: location as string,
      job_type: job_type as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const jobs = await this.jobService.getAllJobs(filters);

    // FIX: Check if no jobs were found (empty array)
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No jobs found matching your criteria',
        data: [],
        count: 0
      });
    }

    // Jobs were found - return success response
    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

  // Get single job by ID (Public)
  async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const jobId = parseInt(id);
      if (isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID'
        });
      }

      const job = await this.jobService.getJobById(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      res.json({
        success: true,
        data: job
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get jobs by logged-in employer
  async getEmployerJobs(req: AuthRequest, res: Response) {
    try {
      const { user } = req;

      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          success: false,
          message: 'Only employers can view their jobs'
        });
      }

      const jobs = await this.jobService.getJobsByEmployer(user.id);

      res.json({
        success: true,
        data: jobs,
        count: jobs.length
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update job (Owner only)
  async updateJob(req: AuthRequest, res: Response) {
    try {
      const { user } = req;
      const { id } = req.params;
      const { 
        title, 
        description, 
        requirements, 
        location, 
        salary_range, 
        job_type 
      } = req.body;

      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          success: false,
          message: 'Only employers can update jobs'
        });
      }

      const jobId = parseInt(id);
      if (isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID'
        });
      }

      const updates = {
        title,
        description,
        requirements,
        location,
        salary_range,
        job_type
      };

      const updatedJob = await this.jobService.updateJob(jobId, user.id, updates);

      if (!updatedJob) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or you do not have permission'
        });
      }

      res.json({
        success: true,
        message: 'Job updated successfully',
        data: updatedJob
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete job (Owner only)
  async deleteJob(req: AuthRequest, res: Response) {
    try {
      const { user } = req;
      const { id } = req.params;

      if (!user || user.role !== 'employer') {
        return res.status(403).json({
          success: false,
          message: 'Only employers can delete jobs'
        });
      }

      const jobId = parseInt(id);
      if (isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID'
        });
      }

      const deleted = await this.jobService.deleteJob(jobId, user.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or you do not have permission'
        });
      }

      res.json({
        success: true,
        message: 'Job deleted successfully'
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default JobController;