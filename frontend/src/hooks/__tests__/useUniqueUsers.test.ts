import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../services/api', () => ({
  activityLogService: { getUniqueUsers: vi.fn() },
}));

import { useUniqueUsers } from '../useUniqueUsers';
import { activityLogService } from '../../services/api';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUniqueUsers', () => {
  it('returns an empty array before the query resolves', () => {
    vi.mocked(activityLogService.getUniqueUsers).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useUniqueUsers(), { wrapper: createWrapper() });

    expect(result.current).toEqual([]);
  });

  it('returns the fetched list of unique users', async () => {
    vi.mocked(activityLogService.getUniqueUsers).mockResolvedValue(['a@b.c', 'c@d.e']);

    const { result } = renderHook(() => useUniqueUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current).toEqual(['a@b.c', 'c@d.e']));
  });
});
