export interface Project {
  id: string;
  title: string;
  description: string[];
  image_url: string;
  tags: string[];
  location?: string;
  area?: string;
  year?: string;
  team?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  image: File;
  tags: string[];
  location?: string;
  area?: string;
  year?: string;
  team?: string;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  image?: File;
  tags?: string[];
  location?: string;
  area?: string;
  year?: string;
  team?: string;
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
