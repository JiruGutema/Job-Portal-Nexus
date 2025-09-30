export interface EmployerProfile {
  id?: number;
  user_id: number;
  company_name: string;
  description: string;
  industry?: string;
  logo_url?: string;
  created_at?: Date;
  updated_at?: Date;
}
export default EmployerProfile;