export interface JobSeekerProfile {
  id?: number;
  user_id: number;
  skills: string[];
  education?: string;
  experience?: string;
  resume_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export default JobSeekerProfile;