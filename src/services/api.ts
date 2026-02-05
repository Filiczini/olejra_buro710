import api from '../api/client';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },

  logout: async () => {
    await api.post('/admin/logout');
  },
};

export const contentService = {
  getAll: async () => {
    const response = await api.get('/content');
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/content/${id}`, data);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/content', data);
    return response.data;
  },
};

export const portfolioService = {
  getAll: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/portfolio/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/portfolio', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/portfolio/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/portfolio/${id}`);
    return response.data;
  },
};
