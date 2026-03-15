import api from '../api/client';
import type { PaginatedResponse } from '../types/post';
import type { ActivityLog, ActivityLogsParams } from '../types/activityLog';
import type { Post, PostPaginationParams } from '../types/post';
import type { Block } from '../types/block';
import type { ContactFormData, ContactSubmitResponse } from '../types/contact';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },
  logout: async () => {
    await api.post('/admin/logout');
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

  getFeatured: async () => {
    const response = await api.get('/posts/featured');
    return response.data as Post[];
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

export const contactService = {
  submit: async (data: ContactFormData): Promise<ContactSubmitResponse> => {
    const response = await api.post('/contact', data);
    return response.data as ContactSubmitResponse;
  },
};
