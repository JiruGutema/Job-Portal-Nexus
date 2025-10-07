export interface JobSeekerProfile {
  id?: number;
  user_id: number;
  skills: string[];
  education?: string;
  experience?: string;
  resume_url?: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export default JobSeekerProfile;

// - Models define the data shape returned by repositories/services; 
// optional fields are marked with `?`.