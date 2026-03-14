export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
};

export type JobOrder = {
  id: number;
  recruiter_id: number;
  title: string;
  company?: string | null;
  description: string | null;
  location: string | null;
  salary_min: string | null;
  salary_max: string | null;
  status: string;
  created_at: string;
};

export type Company = {
  id: string;
  name: string;
  email: string;
  contact: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  keyTechnologies: string | null;
  clientId: string | null;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
