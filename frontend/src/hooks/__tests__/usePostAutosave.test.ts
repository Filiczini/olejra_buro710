import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../services/api', () => ({
  postService: { create: vi.fn(), update: vi.fn() },
}));
vi.mock('../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { usePostAutosave, type AutosaveSnapshot } from '../usePostAutosave';
import { postService } from '../../services/api';

function snapshot(overrides: Partial<AutosaveSnapshot> = {}): AutosaveSnapshot {
  return {
    title: 'Draft title',
    slug: 'draft-title',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    featured: false,
    heroData: {},
    ogImageFile: null,
    galleryImages: [],
    galleryNewFiles: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePostAutosave', () => {
  it('does nothing for a published post', async () => {
    const { result } = renderHook(() => usePostAutosave(undefined));

    let value;
    await act(async () => {
      value = await result.current.autosave(snapshot({ status: 'published' }));
    });

    expect(value).toBeNull();
    expect(postService.create).not.toHaveBeenCalled();
    expect(postService.update).not.toHaveBeenCalled();
  });

  it('creates the post when there is no id yet', async () => {
    vi.mocked(postService.create).mockResolvedValue({ id: 'new-id' } as never);
    const { result } = renderHook(() => usePostAutosave(undefined));

    let value;
    await act(async () => {
      value = await result.current.autosave(snapshot());
    });

    expect(postService.create).toHaveBeenCalledWith(expect.any(FormData));
    expect(postService.update).not.toHaveBeenCalled();
    expect(value).toEqual({ id: 'new-id' });
  });

  it('omits blocks from the autosave payload entirely', async () => {
    vi.mocked(postService.create).mockResolvedValue({ id: 'new-id' } as never);
    const { result } = renderHook(() => usePostAutosave(undefined));

    await act(async () => {
      await result.current.autosave(snapshot());
    });

    const [formData] = vi.mocked(postService.create).mock.calls[0] as [FormData];
    expect(formData.get('blocks')).toBeNull();
    expect(formData.getAll('blockImages')).toEqual([]);
  });

  it('updates the existing post when an id is given', async () => {
    vi.mocked(postService.update).mockResolvedValue({ id: 'post-1' } as never);
    const { result } = renderHook(() => usePostAutosave('post-1'));

    await act(async () => {
      await result.current.autosave(snapshot());
    });

    expect(postService.update).toHaveBeenCalledWith('post-1', expect.any(FormData));
    expect(postService.create).not.toHaveBeenCalled();
  });

  it('returns null and logs when the request fails, instead of throwing', async () => {
    vi.mocked(postService.create).mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => usePostAutosave(undefined));

    let value;
    await act(async () => {
      value = await result.current.autosave(snapshot());
    });

    expect(value).toBeNull();
  });
});
