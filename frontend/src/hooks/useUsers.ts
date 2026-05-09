import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/api';
import type { User } from '@buro710/shared';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: boolean;
  refresh: () => void;
}

export function useUsers(): UseUsersResult {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  return {
    users: data ?? [],
    loading: isLoading,
    error: isError,
    refresh: refetch,
  };
}
