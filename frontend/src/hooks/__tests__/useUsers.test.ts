import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../services/api', () => ({
  userService: { getAll: vi.fn() },
}));

import { useUsers } from '../useUsers';
import { userService } from '../../services/api';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUsers', () => {
  it('starts loading with an empty list', () => {
    vi.mocked(userService.getAll).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(false);
  });

  it('returns the fetched users once loaded', async () => {
    const users = [{ id: 'u1', email: 'a@b.c', role: 'admin', created_at: '' }];
    vi.mocked(userService.getAll).mockResolvedValue(users as never);

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users).toEqual(users);
  });

  it('reports an error when the fetch fails', async () => {
    vi.mocked(userService.getAll).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.users).toEqual([]);
  });

  it('refresh() re-triggers the query', async () => {
    vi.mocked(userService.getAll).mockResolvedValue([] as never);
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.refresh();

    expect(userService.getAll).toHaveBeenCalledTimes(2);
  });
});
