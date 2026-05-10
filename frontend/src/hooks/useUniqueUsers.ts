import { useQuery } from '@tanstack/react-query';
import { activityLogService } from '../services/api';

export function useUniqueUsers() {
  const { data: uniqueUsers = [] } = useQuery({
    queryKey: ['activityLogs', 'uniqueUsers'],
    queryFn: () => activityLogService.getUniqueUsers(),
    staleTime: 5 * 60 * 1000,
  });

  return uniqueUsers;
}
