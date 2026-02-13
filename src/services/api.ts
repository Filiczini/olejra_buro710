import api from '../api/client';
import type {
  PaginatedResponse,
  Project,
  PaginationParams,
  FilterOptions,
} from '../types/project';
import type {
  ActivityLog,
  ActivityLogsParams,
} from '../types/activityLog';
import type { Post, PostPaginationParams } from '../types/post';
import type { Block } from '../types/block';
import type { PortfolioAllParams, PortfolioAllResponse } from '../types/portfolio';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },
  logout: async () => {
    await api.post('/admin/logout');
  },
};

export const portfolioService = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
    if (params?.location) queryParams.append('location', params.location);
    if (params?.year) queryParams.append('year', params.year);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/portfolio?${queryParams.toString()}`);
    return response.data as PaginatedResponse<Project>;
  },

  getFilters: async () => {
    const response = await api.get('/portfolio/filters');
    return response.data as FilterOptions;
  },

  getById: async (id: string) => {
    const response = await api.get(`/portfolio/${id}`);
    return response.data as { project: Project, heroMedia: { id: string; url: string }[] };
  },

  create: async (data: FormData) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/portfolio', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as Project;
  },

  update: async (id: string, data: FormData) => {
    const token = localStorage.getItem('token');
    const response = await api.put(`/portfolio/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as Project;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/portfolio/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getNextProject: async (currentId: string): Promise<Project | null> => {
    try {
      const { data } = await api.get<PaginatedResponse<Project>>('/portfolio', {
        params: {
          limit: 50,
          sortBy: 'created_at',
          sortOrder: 'asc'
        }
      });

      const currentIndex = data.data.findIndex(p => p.id === currentId);
      if (currentIndex === -1 || currentIndex === data.data.length - 1) {
        return null;
      }

      return data.data[currentIndex + 1];
    } catch (error) {
      console.error('Error getting next project:', error);
      return null;
    }
  },

  getAllWithPosts: async (params?: PortfolioAllParams): Promise<PortfolioAllResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/portfolio/all?${queryParams.toString()}`);
    return response.data as PortfolioAllResponse;
  },
};

export const activityLogService = {
  getAll: async (params?: ActivityLogsParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.user_email) queryParams.append('user_email', params.user_email);
    if (params?.action) queryParams.append('action', params.action);

    const response = await api.get(`/logs?${queryParams.toString()}`);
    return response.data as PaginatedResponse<ActivityLog>;
  },

  getUniqueUsers: async () => {
    const response = await api.get('/logs/users');
    return response.data as string[];
  },
};

export const postService = {
  getAll: async (params?: PostPaginationParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/posts?${queryParams.toString()}`);
    return response.data as PaginatedResponse<Post>;
  },

  getById: async (id: string) => {
    const response = await api.get(`/posts/${id}`);
    return response.data as { post: Post; blocks: Block[] };
  },

  getBySlug: async (slug: string) => {
    const response = await api.get(`/posts/public/${slug}`);
    return response.data as { post: Post; blocks: Block[] };
  },

  create: async (data: FormData) => {
    const response = await api.post('/posts', data);
    return response.data as Post;
  },

  update: async (id: string, data: FormData) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data as Post;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};

