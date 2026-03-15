import type { Block, BlockType, BlockData } from './block';

export type PostStatus = 'draft' | 'published';

export interface PostHero {
  hero_image_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_tags?: string[];
  hero_location?: string;
  hero_year?: string;
}

export interface Post extends PostHero {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  gallery_images?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  blocks?: Block[];
}

export interface CreatePostData extends PostHero {
  title: string;
  slug: string;
  status?: PostStatus;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  gallery_images?: string[];
  blocks?: {
    type: BlockType;
    data: BlockData;
    sort_order?: number;
  }[];
}

export interface UpdatePostData extends Partial<PostHero> {
  title?: string;
  slug?: string;
  status?: PostStatus;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  gallery_images?: string[];
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
