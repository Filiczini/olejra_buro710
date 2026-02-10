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

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },
  logout: async () => {
    await api.post('/admin/logout');
  },
};

export const siteSettingsService = {
  getAll: async () => {
    const response = await api.get('/settings');
    return response.data;
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
    return response.data as { project: Project, heroMedia: any[], galleryMedia: any[] };
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

