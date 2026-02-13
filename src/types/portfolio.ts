export type PortfolioItemType = 'project' | 'post';

export interface PortfolioItem {
  id: string;
  type: PortfolioItemType;
  title: string;
  subtitle?: string;
  image_url: string;
  tags: string[];
  location?: string;
  year?: string;
  slug?: string;
  created_at: string;
}

export interface PortfolioAllParams {
  page?: number;
  limit?: number;
  tags?: string[];
  search?: string;
}

export interface PortfolioAllResponse {
  data: PortfolioItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    tags: string[];
  };
}
