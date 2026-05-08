import api from '../api/client';
import type { AxiosRequestConfig } from 'axios';
import type {
  PaginatedResponse,
  Post,
  PostPaginationParams,
  Block,
  ActivityLog,
  ActivityLogsParams,
  ContactFormData,
  ContactSubmitResponse,
} from '@buro710/shared';

async function get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get(url, config);
  return response.data as T;
}

async function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post(url, data, config);
  return response.data as T;
}

async function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.put(url, data, config);
  return response.data as T;
}

async function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete(url, config);
  return response.data as T;
}

async function patch<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.patch(url, data, config);
  return response.data as T;
}

export const authService = {
  login: async (email: string, password: string) => {
    return post('/admin/login', { email, password });
  },
  logout: async () => {
    await post('/admin/logout');
  },
};

export const activityLogService = {
  getAll: async (params?: ActivityLogsParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.user_email) queryParams.append('user_email', params.user_email);
    if (params?.action) queryParams.append('action', params.action);

    return get<PaginatedResponse<ActivityLog>>(`/logs?${queryParams.toString()}`);
  },

  getUniqueUsers: async () => {
    return get<string[]>('/logs/users');
  },
};

export const postService = {
  getAll: async (params?: PostPaginationParams) => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    return get<PaginatedResponse<Post>>(`/posts?${queryParams.toString()}`);
  },

  getById: async (id: string) => {
    return get<{ post: Post; blocks: Block[] }>(`/posts/${id}`);
  },

  getBySlug: async (slug: string) => {
    return get<{ post: Post; blocks: Block[] }>(`/posts/public/${slug}`);
  },

  getFeatured: async () => {
    return get<Post[]>('/posts/featured');
  },

  create: async (data: FormData) => {
    return post<Post>('/posts', data, { timeout: 120000 });
  },

  update: async (id: string, data: FormData) => {
    return put<Post>(`/posts/${id}`, data, { timeout: 120000 });
  },

  delete: async (id: string) => {
    return del(`/posts/${id}`);
  },
};

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export const userService = {
  getAll: async () => {
    return get<User[]>('/admin/users');
  },

  create: async (data: { email: string; password: string; role: string }) => {
    return post<User>('/admin/users', data);
  },

  delete: async (id: string) => {
    return del(`/admin/users/${id}`);
  },

  updatePassword: async (id: string, password: string) => {
    return patch(`/admin/users/${id}/password`, { password });
  },
};

export const contactService = {
  submit: async (data: ContactFormData): Promise<ContactSubmitResponse> => {
    return post<ContactSubmitResponse>('/contact', data);
  },
};
