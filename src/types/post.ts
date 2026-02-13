import type { Block, BlockType, BlockData } from './block';

export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  created_at: string;
  updated_at: string;
  blocks?: Block[];
}

export interface CreatePostData {
  title: string;
  slug: string;
  status?: PostStatus;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  blocks?: {
    type: BlockType;
    data: BlockData;
    sort_order?: number;
  }[];
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  status?: PostStatus;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  blocks?: {
    id?: string;
    type: BlockType;
    data: BlockData;
    sort_order: number;
  }[];
}

export interface PostPaginationParams {
  page?: number;
  limit?: number;
  status?: PostStatus;
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
