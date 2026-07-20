import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../../services/api', () => ({
  postService: { getBySlug: vi.fn() },
}));
vi.mock('../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { usePublicPost } from '../usePublicPost';
import { postService } from '../../services/api';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePublicPost', () => {
  it('does nothing when no slug is provided', () => {
    const { result } = renderHook(() => usePublicPost(undefined));

    expect(result.current.loading).toBe(true);
    expect(postService.getBySlug).not.toHaveBeenCalled();
  });

  it('loads the post and its blocks for a given slug', async () => {
    const post = { id: 'p1', title: 'T', slug: 'my-slug', status: 'published' };
    const blocks = [{ id: 'b1', post_id: 'p1', type: 'text_full', data: {}, sort_order: 0 }];
    vi.mocked(postService.getBySlug).mockResolvedValue({ post, blocks } as never);

    const { result } = renderHook(() => usePublicPost('my-slug'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.post).toEqual(post);
    expect(result.current.blocks).toEqual(blocks);
    expect(result.current.error).toBe(false);
    expect(postService.getBySlug).toHaveBeenCalledWith('my-slug');
  });

  it('sets error when the post cannot be loaded', async () => {
    vi.mocked(postService.getBySlug).mockRejectedValue(new Error('not found'));

    const { result } = renderHook(() => usePublicPost('missing'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.post).toBeNull();
  });

  it('re-fetches when the slug changes', async () => {
    vi.mocked(postService.getBySlug).mockResolvedValueOnce({
      post: { id: 'p1', title: 'First', slug: 'first', status: 'published' },
      blocks: [],
    } as never);

    const { result, rerender } = renderHook(({ slug }) => usePublicPost(slug), {
      initialProps: { slug: 'first' as string | undefined },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.post?.slug).toBe('first');

    vi.mocked(postService.getBySlug).mockResolvedValueOnce({
      post: { id: 'p2', title: 'Second', slug: 'second', status: 'published' },
      blocks: [],
    } as never);
    rerender({ slug: 'second' });

    await waitFor(() => expect(result.current.post?.slug).toBe('second'));
    expect(postService.getBySlug).toHaveBeenCalledTimes(2);
  });

  it('ignores a stale response after the component unmounts', async () => {
    let resolveFetch!: (value: unknown) => void;
    vi.mocked(postService.getBySlug).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }) as never
    );

    const { unmount } = renderHook(() => usePublicPost('slow-slug'));
    unmount();

    resolveFetch({
      post: { id: 'p1', title: 'T', slug: 'slow-slug', status: 'published' },
      blocks: [],
    });
    await Promise.resolve();
  });
});
