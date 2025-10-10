import { Response, NextFunction } from 'express';
import { SavedJobService } from '../services/savedJobs.service';
import { SaveJobData, RemoveSavedJobData } from '../models/SavedJobs';
import { AuthRequest } from '../middlewares/auth.middleware';

export class SavedJobController {
  private savedJobService: SavedJobService;

  constructor() {
    this.savedJobService = new SavedJobService();
  }

  // Save a job for later (Seeker only)
  async saveJob(request: AuthRequest, response: Response, next: NextFunction) {
    try {
      const job_id = parseInt(request.params.id);
      const seeker_id = request.user!.id;
   
      if (!job_id || job_id <= 0) {
        return response.status(400).json({
          success: false,
          message: 'Valid job ID is required'
        });
      }

      const saveData: SaveJobData = {
        job_id,
        seeker_id
      };

      const savedJob = await this.savedJobService.saveJob(saveData);

      response.status(201).json({
        success: true,
        message: 'Job saved successfully',
        data: savedJob
      });

    } catch (error: any) {
      console.error('Save job error:', error);
      
      if (error.message === 'Job is already saved') {
        return response.status(409).json({
          success: false,
          message: error.message
        });
      }

      response.status(500).json({
        success: false,
        message: 'Failed to save job'
      });
    }
  }

  // Get saved jobs list (Seeker only)
  async getSavedJobs(request: AuthRequest, response: Response, next: NextFunction) {
    try {
      const seeker_id = request.user!.id;

      const savedJobs = await this.savedJobService.getSavedJobs(seeker_id);

      response.json({
        success: true,
        data: savedJobs
      });

    } catch (error: any) {
      response.status(500).json({
        success: false,
        message: 'Failed to fetch saved jobs'
      });
    }
  }

  // Remove job from saved list (Seeker only)
  async removeSavedJob(request: AuthRequest, response: Response, next: NextFunction) {
    try { console.log("➡️ removesavedjobs called for seeker:", request.user!.id);
      const job_id = parseInt(request.params.id);
      const seeker_id = request.user!.id;

      if (!job_id || job_id <= 0) {
        return response.status(400).json({
          success: false,
          message: 'Valid job ID is required'
        });
      }

      const removeData: RemoveSavedJobData = {
        job_id,
        seeker_id
      };

      const result = await this.savedJobService.removeSavedJob(removeData);

      if (!result) {
        return response.status(404).json({
          success: false,
          message: 'Saved job not found'
        });
      }

      response.json({
        success: true,
        message: 'Job removed from saved list successfully'
      });

    } catch (error: any) {
      console.error('Remove saved job error:', error);
      
      if (error.message === 'Saved job not found') {
        return response.status(404).json({
          success: false,
          message: error.message
        });
      }

      response.status(500).json({
        success: false,
        message: 'Failed to remove job from saved list'
      });
    }
  }
}
