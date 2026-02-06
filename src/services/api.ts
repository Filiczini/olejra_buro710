import api from '../api/client';
import type {
  PaginatedResponse,
  Project,
  PaginationParams,
  FilterOptions,
} from '../types/project';

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
    return response.data as Project;
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
};
