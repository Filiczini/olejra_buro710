import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  setFilter: <K extends keyof F>(key: K, value: F[K] | undefined) => void;
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
  const [filters, setFilters] = useState<F>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<F>(initialFilters);
  const [targetPage, setTargetPage] = useState(defaultPage);
  const [pagination, setPagination] = useState<PaginationState>({
    page: defaultPage,
    limit: defaultLimit,
    total: 0,
    totalPages: 0,
  });

  const fetchDataRef = useRef(fetchData);
  useLayoutEffect(() => {
    fetchDataRef.current = fetchData;
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset to first page when debounced filters change
  useEffect(() => {
    queueMicrotask(() => {
      setTargetPage(defaultPage);
    });
  }, [debouncedFilters, defaultPage]);

  const {
    data: queryResult,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminList', { page: targetPage, limit: defaultLimit, ...debouncedFilters }],
    queryFn: () =>
      fetchDataRef.current({ page: targetPage, limit: defaultLimit, ...debouncedFilters }),
    structuralSharing: false,
  });

  useEffect(() => {
    if (queryResult) {
      queueMicrotask(() => {
        setData(queryResult.data);
        setPagination((prev) => ({
          ...prev,
          page: targetPage,
          total: queryResult.pagination.total,
          totalPages: queryResult.pagination.totalPages,
        }));
      });
    }
  }, [queryResult, targetPage]);

  useEffect(() => {
    if (isError && error) {
      logger.error('Error loading data', error);
    }
  }, [isError, error]);

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K] | undefined) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value } as F;
      if ((key as string) === 'search') {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          setDebouncedFilters(next);
        }, 300);
      } else {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        setDebouncedFilters(next);
      }
      return next;
    });
  }, []);

  const setPage = useCallback((page: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setTargetPage(page);
  }, []);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    setData,
    loading: isFetching,
    pagination,
    filters,
    setFilter,
    setPage,
    refresh,
  };
}
