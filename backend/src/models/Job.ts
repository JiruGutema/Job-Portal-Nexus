export interface Job {
  id?: number;
  employer_id: number;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  created_at?: Date;
  updated_at?: Date;
}

export interface JobFilters {
  search?: string;
  location?: string;
  job_type?: string;
  page?: number;
  limit?: number;
}