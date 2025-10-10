export interface SavedJob {
  id?: number;
  job_id: number;
  seeker_id: number;
  created_at?: Date;
}

// For saving a job
export interface SaveJobData {
  job_id: number;
  seeker_id: number;
}

// For removing a saved job
export interface RemoveSavedJobData {
  job_id: number;
  seeker_id: number;
}