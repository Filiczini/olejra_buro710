import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const response = await api.get('/admin/me');
        return response.data as { id: string; email: string; role: string };
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status !== 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } catch {
      // Continue with local cleanup
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    queryClient.setQueryData(['auth', 'me'], null);
  };

  return { isAuthenticated: !!user, isLoading, handleLogout };
}
