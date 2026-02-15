export interface Media {
  id: string;
  url: string;
  role: 'hero';
  sort_order: number;
  alt?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  tags: string[];
  location?: string;
  year?: string;
  area?: string;
  created_at: string;
  updated_at: string;
  heroMedia?: Media[];
}

export interface CreateProjectData {
  title: string;
  subtitle?: string;
  tags: string[];
  location?: string;
  year?: string;
  area?: string;
  heroMedia?: File;
}

export interface UpdateProjectData {
  title?: string;
  subtitle?: string;
  tags?: string[];
  location?: string;
  year?: string;
  area?: string;
  heroMedia?: File;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
  location?: string;
  year?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  tags: string[];
  locations: string[];
  years: string[];
}
