import { useState, useEffect, useCallback } from 'react';
import { logger } from '../lib/logger';
import type { PaginatedResponse } from '@buro710/shared';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseAdminListPageOptions<T, F extends object> {
  fetchData: (params: { page: number; limit: number } & F) => Promise<PaginatedResponse<T>>;
  defaultPage?: number;
  defaultLimit?: number;
  initialFilters?: F;
}

export interface UseAdminListPageResult<T, F> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  loading: boolean;
  pagination: PaginationState;
  filters: F;
  setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function useAdminListPage<T, F extends object>({
  fetchData,
  defaultPage = 1,
  defaultLimit = 10,
  initialFilters = {} as F,
}: UseAdminListPageOptions<T, F>): UseAdminListPageResult<T, F> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<F>(initialFilters);
  const [targetPage, setTargetPage] = useState(defaultPage);
  const [pagination, setPagination] = useState<PaginationState>({
    page: defaultPage,
    limit: defaultLimit,
    total: 0,
    totalPages: 0,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Data-fetching effect: setLoading synchronously to show loading state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchData({ page: targetPage, limit: defaultLimit, ...filters })
      .then((result) => {
        if (cancelled) return;
        setData(result.data);
        setPagination((prev) => ({
          ...prev,
          page: targetPage,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        }));
      })
      .catch((error) => {
        if (cancelled) return;
        logger.error('Error loading data', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetPage, filters, fetchData, defaultLimit, tick]);

  const setFilter = useCallback(
    <K extends keyof F>(key: K, value: F[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setTargetPage(defaultPage);
    },
    [defaultPage]
  );

  const setPage = useCallback((page: number) => {
    setTargetPage(page);
  }, []);

  const refresh = useCallback(() => {
    setTick((v) => v + 1);
  }, []);

  return {
    data,
    setData,
    loading,
    pagination,
    filters,
    setFilter,
    setPage,
    refresh,
  };
}
