export interface DesignZone {
  id: string;
  name: string;
  order: number;
  title: string;
  description: string;
  image_url?: string;
  layout?: 'full-width' | 'split' | 'centered' | 'split-reverse';
  features?: string[];
  alt?: string;
}

export interface ProjectImage {
  url: string;
  caption?: string;
  alt?: string;
}

export interface Material {
  name: string;
  color?: string;
  type?: 'surface' | 'accent' | 'natural';
}

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

  // New optional fields for enhanced design
  category?: string;
  category_primary?: string;
  category_secondary?: string;
  short_description?: string;
  subtitle?: string;
  photo_credits?: string;
  project_images?: ProjectImage[];
  design_zones?: DesignZone[];
  materials?: Material[];
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
