import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/me');
        return response.data as { id: string; email: string; role: string };
      } catch {
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
      // Cookies are cleared server-side; ignore network errors
    }
    queryClient.setQueryData(['auth', 'me'], null);
  };

  return { isAuthenticated: !!user, isLoading, role: user?.role, handleLogout };
}
