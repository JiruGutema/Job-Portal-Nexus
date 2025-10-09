export interface Application {
  id?: number;
  job_id: number;
  seeker_id: number;
  status: 'applied' | 'reviewed' | 'rejected' | 'hired';
  created_at?: Date;
  updated_at?: Date;
}

// For applying to a job
export interface ApplyToJobData {
  job_id: number;
  seeker_id: number;
}

// For updating application status
export interface UpdateApplicationStatus {
  status: 'reviewed' | 'rejected' | 'hired';
}