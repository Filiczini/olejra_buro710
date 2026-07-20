import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAdminListPage } from '../useAdminListPage';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

interface Item {
  id: string;
}

function page(items: Item[], total = items.length) {
  return { data: items, pagination: { page: 1, limit: 10, total, totalPages: 1 } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAdminListPage', () => {
  it('fetches page 1 on mount and exposes the resolved data and pagination', async () => {
    const fetchData = vi.fn().mockResolvedValue(page([{ id: '1' }, { id: '2' }], 2));

    const { result } = renderHook(
      () => useAdminListPage<Item, Record<string, never>>({ fetchData, defaultLimit: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([{ id: '1' }, { id: '2' }]);
    expect(result.current.pagination).toMatchObject({ page: 1, total: 2 });
    expect(fetchData).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('setPage(2) fetches the next page immediately, without debounce', async () => {
    const fetchData = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(
      () => useAdminListPage<Item, Record<string, never>>({ fetchData, defaultLimit: 10 }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() =>
      expect(fetchData).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    );
  });

  it('setFilter on a non-search key applies without waiting', async () => {
    const fetchData = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(
      () => useAdminListPage<Item, { status?: string }>({ fetchData, defaultLimit: 10 }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setFilter('status', 'published');
    });

    await waitFor(() =>
      expect(fetchData).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }))
    );
  });

  it('debounces a search filter before triggering the fetch', async () => {
    const fetchData = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(
      () => useAdminListPage<Item, { search?: string }>({ fetchData, defaultLimit: 10 }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBeforeSearch = fetchData.mock.calls.length;

    act(() => {
      result.current.setFilter('search', 'diana');
    });

    // Immediately after typing, no new fetch has fired yet.
    expect(fetchData.mock.calls.length).toBe(callsBeforeSearch);

    await waitFor(
      () => expect(fetchData).toHaveBeenCalledWith(expect.objectContaining({ search: 'diana' })),
      { timeout: 1000 }
    );
  });

  it('resets to the default page when a filter changes', async () => {
    const fetchData = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(
      () => useAdminListPage<Item, { status?: string }>({ fetchData, defaultLimit: 10 }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setPage(3);
    });
    await waitFor(() =>
      expect(fetchData).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }))
    );

    act(() => {
      result.current.setFilter('status', 'draft');
    });

    await waitFor(() =>
      expect(fetchData).toHaveBeenCalledWith({ page: 1, limit: 10, status: 'draft' })
    );
  });

  it('refresh() re-runs the current query', async () => {
    const fetchData = vi.fn().mockResolvedValue(page([]));
    const { result } = renderHook(
      () => useAdminListPage<Item, Record<string, never>>({ fetchData, defaultLimit: 10 }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = fetchData.mock.calls.length;

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => expect(fetchData.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it('setData allows optimistic local edits without a refetch', async () => {
    const fetchData = vi.fn().mockResolvedValue(page([{ id: '1' }]));
    const { result } = renderHook(
      () => useAdminListPage<Item, Record<string, never>>({ fetchData, defaultLimit: 10 }),
      { wrapper: createWrapper() }
    );
    await waitFor(() => expect(result.current.data).toEqual([{ id: '1' }]));
    const callsBefore = fetchData.mock.calls.length;

    act(() => {
      result.current.setData((prev) => prev.filter((item) => item.id !== '1'));
    });

    expect(result.current.data).toEqual([]);
    expect(fetchData.mock.calls.length).toBe(callsBefore);
  });
});
