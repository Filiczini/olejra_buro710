import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/api', () => ({
  postService: { getById: vi.fn() },
}));

vi.mock('../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { usePostLoad } from '../usePostLoad';
import { postService } from '../../services/api';

function makeCallbacks() {
  return {
    applyFields: vi.fn(),
    setInitialBlocks: vi.fn(),
    setGalleryImages: vi.fn(),
    setBlocksData: vi.fn(),
    clearDirty: vi.fn(),
    onLoaded: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePostLoad', () => {
  it('re-indexes block sort_order by array position, ignoring the stored value', async () => {
    vi.mocked(postService.getById).mockResolvedValue({
      post: {
        id: 'p1',
        title: 'T',
        slug: 't',
        status: 'draft',
        created_at: '',
        updated_at: '',
      },
      blocks: [
        { id: 'b1', post_id: 'p1', type: 'text_full', data: {}, sort_order: 9, created_at: '' },
        { id: 'b2', post_id: 'p1', type: 'text_full', data: {}, sort_order: 3, created_at: '' },
      ],
    } as never);
    const { result } = renderHook(() => usePostLoad());
    const callbacks = makeCallbacks();

    await act(async () => {
      await result.current.load('p1', callbacks);
    });

    expect(callbacks.setBlocksData).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'b1', sort_order: 0 }),
      expect.objectContaining({ id: 'b2', sort_order: 1 }),
    ]);
  });

  it('defaults optional post fields to empty values when the backend omits them', async () => {
    vi.mocked(postService.getById).mockResolvedValue({
      post: {
        id: 'p1',
        title: 'T',
        slug: 't',
        status: 'draft',
        created_at: '',
        updated_at: '',
      },
      blocks: [],
    } as never);
    const { result } = renderHook(() => usePostLoad());
    const callbacks = makeCallbacks();

    await act(async () => {
      await result.current.load('p1', callbacks);
    });

    expect(callbacks.applyFields).toHaveBeenCalledWith(
      expect.objectContaining({
        slugLocked: true,
        seoTitle: '',
        seoDescription: '',
        featured: false,
        heroData: expect.objectContaining({ hero_title: '', hero_tags: [] }),
      })
    );
    expect(callbacks.setGalleryImages).toHaveBeenCalledWith([]);
    expect(callbacks.clearDirty).toHaveBeenCalled();
    expect(callbacks.onLoaded).toHaveBeenCalled();
  });

  it('navigates back to the list and stops loading when the fetch fails', async () => {
    vi.mocked(postService.getById).mockRejectedValue(new Error('not found'));
    const { result } = renderHook(() => usePostLoad());

    await act(async () => {
      await result.current.load('missing', makeCallbacks());
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts');
    expect(result.current.loading).toBe(false);
  });

  it('sets loading true while the request is in flight', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    vi.mocked(postService.getById).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }) as never
    );
    const { result } = renderHook(() => usePostLoad());

    let loadPromise!: Promise<void>;
    act(() => {
      loadPromise = result.current.load('p1', makeCallbacks());
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFetch({
        post: { id: 'p1', title: 'T', slug: 't', status: 'draft', created_at: '', updated_at: '' },
        blocks: [],
      });
      await loadPromise;
    });

    expect(result.current.loading).toBe(false);
  });
});
