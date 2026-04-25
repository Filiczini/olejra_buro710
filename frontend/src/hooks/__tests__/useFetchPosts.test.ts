import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFetchPosts } from '../useFetchPosts';

vi.mock('../../services/api', () => ({
  postService: {
    getAll: vi.fn(),
    getFeatured: vi.fn(),
  },
}));

import { postService } from '../../services/api';

const mockGetAll = vi.mocked(postService.getAll);
const mockGetFeatured = vi.mocked(postService.getFeatured);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useFetchPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with loading true and empty posts', () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useFetchPosts(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBe(false);
  });

  it('fetches all posts by default', async () => {
    const posts = [
      { id: '1', title: 'Post 1', slug: 'post-1', status: 'published' },
      { id: '2', title: 'Post 2', slug: 'post-2', status: 'published' },
    ];
    mockGetAll.mockResolvedValue({
      data: posts,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    } as never);

    const { result } = renderHook(() => useFetchPosts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.posts).toEqual(posts);
    expect(result.current.error).toBe(false);
    expect(mockGetAll).toHaveBeenCalledWith({ status: undefined, limit: undefined });
  });

  it('fetches featured posts when featured option is true', async () => {
    const posts = [{ id: '1', title: 'Featured', slug: 'featured', status: 'published' }];
    mockGetFeatured.mockResolvedValue(posts as never);

    const { result } = renderHook(() => useFetchPosts({ featured: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.posts).toEqual(posts);
    expect(mockGetFeatured).toHaveBeenCalled();
    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it('passes status and limit to getAll', async () => {
    mockGetAll.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 5, total: 0, totalPages: 0 },
    } as never);

    renderHook(() => useFetchPosts({ status: 'published', limit: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith({ status: 'published', limit: 5 });
    });
  });

  it('sets error to true on fetch failure', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFetchPosts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.posts).toEqual([]);
  });

  it('does not update state after unmount', async () => {
    let resolvePromise!: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGetAll.mockReturnValue(promise as never);

    const { unmount } = renderHook(() => useFetchPosts(), { wrapper: createWrapper() });
    unmount();

    resolvePromise({
      data: [{ id: '1' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    await promise;
  });
});
