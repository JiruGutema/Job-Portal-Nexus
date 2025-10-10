import { SavedJobRepository } from '../repositories/savedJob.repository';
import { SavedJob, SaveJobData, RemoveSavedJobData } from '../models/SavedJobs';

export class SavedJobService {
  private savedJobRepository: SavedJobRepository;

  constructor() {
    this.savedJobRepository = new SavedJobRepository();
  }

  // Save a job with duplicate check
  async saveJob(saveData: SaveJobData): Promise<SavedJob> {
    const { job_id, seeker_id } = saveData;

    // Check if job is already saved
    const existingSavedJob = await this.savedJobRepository.checkJobAlreadySaved(job_id, seeker_id);
    
    if (existingSavedJob) {
      throw new Error('Job is already saved');
    }

    // Save the job
    return await this.savedJobRepository.saveJob(saveData);
  }

  // Get saved jobs for a seeker
  async getSavedJobs(seekerId: number): Promise<SavedJob[]> {
    if (!seekerId || seekerId <= 0) {
      throw new Error('Valid seeker ID is required');
    }

    return await this.savedJobRepository.getSavedJobsBySeeker(seekerId);
  }

  // Remove job from saved list with ownership check
  async removeSavedJob(removeData: RemoveSavedJobData): Promise<boolean> {
    const { job_id, seeker_id } = removeData;

    if (!job_id || job_id <= 0) {
      throw new Error('Valid job ID is required');
    }

    // Check if the saved job exists and belongs to seeker
    const existingSavedJob = await this.savedJobRepository.getSavedJobById(job_id, seeker_id);
    
    if (!existingSavedJob) {
      throw new Error('Saved job not found');
    }

    return await this.savedJobRepository.removeSavedJob(removeData);
  }

  // Check if job is saved by user
  async isJobSaved(jobId: number, seekerId: number): Promise<boolean> {
    if (!jobId || jobId <= 0) {
      throw new Error('Valid job ID is required');
    }

    const savedJob = await this.savedJobRepository.checkJobAlreadySaved(jobId, seekerId);
    return !!savedJob;
  }
}