import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn().mockReturnValue({});

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

vi.mock('../../services/api', () => ({
  postService: {
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@buro710/shared', () => ({
  postCreateSchema: {
    safeParse: vi.fn(),
  },
  generateSlug: vi.fn((title: string) => title.toLowerCase().replace(/\s+/g, '-')),
}));

import { usePostForm } from '../usePostForm';
import { postService } from '../../services/api';
import { postCreateSchema } from '@buro710/shared';

const mockSafeParse = vi.mocked(postCreateSchema.safeParse);

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('usePostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({});
    mockSafeParse.mockReturnValue({ success: true, data: {} } as never);
  });

  it('initializes with default state for new post', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.title).toBe('');
    expect(result.current.slug).toBe('');
    expect(result.current.slugLocked).toBe(false);
    expect(result.current.status).toBe('draft');
    expect(result.current.formState.loading).toBe(false);
    expect(result.current.formState.saving).toBe(false);
    expect(result.current.formState.errors).toEqual({});
    expect(result.current.featured).toBe(false);
  });

  it('slugLocked is true initially when editing', () => {
    mockUseParams.mockReturnValue({ id: 'post-123' });
    vi.mocked(postService.getById).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    expect(result.current.slugLocked).toBe(true);
  });

  it('sets isEditing to true when id param exists', () => {
    mockUseParams.mockReturnValue({ id: 'post-123' });

    vi.mocked(postService.getById).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    expect(result.current.isEditing).toBe(true);
  });

  it('handleTitleChange updates title and generates slug for new post', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleTitleChange('My New Post');
    });

    expect(result.current.title).toBe('My New Post');
    expect(result.current.slug).toBe('my-new-post');
  });

  it('handleTitleChange continuously updates slug while unlocked', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleTitleChange('First');
    });
    expect(result.current.slug).toBe('first');

    act(() => {
      result.current.handleTitleChange('First Second');
    });
    expect(result.current.slug).toBe('first-second');
  });

  it('handleTitleChange does not overwrite slug when editing', () => {
    mockUseParams.mockReturnValue({ id: 'post-123' });
    vi.mocked(postService.getById).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleTitleChange('Updated Title');
    });

    expect(result.current.title).toBe('Updated Title');
    expect(result.current.slug).toBe('');
  });

  it('handleTitleChange does not overwrite manually set slug', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleSlugChange('custom-slug');
    });

    act(() => {
      result.current.handleTitleChange('Some Title');
    });

    expect(result.current.slug).toBe('custom-slug');
    expect(result.current.slugLocked).toBe(true);
  });

  it('handleSlugChange locks slug and stops auto-generation', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleSlugChange('my-custom-slug');
    });

    expect(result.current.slug).toBe('my-custom-slug');
    expect(result.current.slugLocked).toBe(true);

    act(() => {
      result.current.handleTitleChange('Any Title');
    });

    expect(result.current.slug).toBe('my-custom-slug');
  });

  it('handleSlugUnlock regenerates slug from current title and unlocks', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleTitleChange('My Post Title');
    });
    act(() => {
      result.current.handleSlugChange('old-manual-slug');
    });
    expect(result.current.slugLocked).toBe(true);

    act(() => {
      result.current.handleSlugUnlock();
    });

    expect(result.current.slugLocked).toBe(false);
    expect(result.current.slug).toBe('my-post-title');
  });

  it('setStatus updates status', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.setStatus('published');
    });

    expect(result.current.status).toBe('published');
  });

  it('setFeatured toggles featured state', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.setFeatured(true);
    });

    expect(result.current.featured).toBe(true);
  });

  it('setSeoTitle and setSeoDescription update SEO fields', () => {
    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.seoProps.onSeoTitleChange('SEO Title');
      result.current.seoProps.onSeoDescriptionChange('SEO Description');
    });

    expect(result.current.seoProps.seoTitle).toBe('SEO Title');
    expect(result.current.seoProps.seoDescription).toBe('SEO Description');
  });

  it('handleSubmit validates and shows errors on invalid data', async () => {
    mockSafeParse.mockReturnValue({
      success: false,
      error: {
        issues: [
          { path: ['title'], message: 'Title is required' },
          { path: ['slug'], message: 'Slug is required' },
        ],
      },
    } as never);

    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    await act(async () => {
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.formState.handleSubmit(fakeEvent);
    });

    expect(result.current.formState.errors).toEqual({
      title: 'Title is required',
      slug: 'Slug is required',
    });
    expect(postService.create).not.toHaveBeenCalled();
  });

  it('handleSubmit creates new post on valid data', async () => {
    vi.mocked(postService.create).mockResolvedValue({} as never);

    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleTitleChange('Test Post');
    });

    await act(async () => {
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.formState.handleSubmit(fakeEvent);
    });

    expect(postService.create).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts', { state: { saved: true } });
  });

  it('handleSubmit updates existing post when editing', async () => {
    mockUseParams.mockReturnValue({ id: 'post-123' });
    vi.mocked(postService.getById).mockResolvedValue({
      post: {
        id: 'post-123',
        title: 'Existing Post',
        slug: 'existing-post',
        status: 'draft',
        created_at: '',
        updated_at: '',
      },
      blocks: [],
    } as never);
    vi.mocked(postService.update).mockResolvedValue({} as never);

    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    // Wait for loadPost to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.formState.handleSubmit(fakeEvent);
    });

    expect(postService.update).toHaveBeenCalledWith('post-123', expect.any(FormData));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts', { state: { saved: true } });
  });

  it('handleSubmit sets error on save failure', async () => {
    vi.mocked(postService.create).mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    await act(async () => {
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.formState.handleSubmit(fakeEvent);
    });

    expect(result.current.formState.errors).toEqual({ submit: 'Помилка збереження посту' });
  });

  it('loads post data when editing', async () => {
    mockUseParams.mockReturnValue({ id: 'post-123' });
    vi.mocked(postService.getById).mockResolvedValue({
      post: {
        id: 'post-123',
        title: 'Loaded Post',
        slug: 'loaded-post',
        status: 'published',
        seo_title: 'SEO',
        seo_description: 'Desc',
        hero_image_url: 'https://example.com/img.jpg',
        hero_title: 'Hero',
        hero_subtitle: 'Sub',
        hero_tags: ['tag1'],
        hero_location: 'Kyiv',
        hero_year: '2025',
        featured: true,
        gallery_images: ['img1.jpg'],
        created_at: '',
        updated_at: '',
      },
      blocks: [{ id: 'b1', type: 'text_full', data: { text: 'Hello' }, sort_order: 0 }],
    } as never);

    const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.title).toBe('Loaded Post');
    expect(result.current.slug).toBe('loaded-post');
    expect(result.current.status).toBe('published');
    expect(result.current.featured).toBe(true);
    expect(result.current.seoProps.seoTitle).toBe('SEO');
    expect(result.current.heroProps.data.hero_title).toBe('Hero');
    expect(result.current.formState.loading).toBe(false);
  });

  it('navigates away on load error', async () => {
    mockUseParams.mockReturnValue({ id: 'bad-id' });
    vi.mocked(postService.getById).mockRejectedValue(new Error('Not found'));

    renderHook(() => usePostForm(), { wrapper: createWrapper() });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts');
  });

  describe('server-side draft autosave', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('creates a draft on the first autosave tick for a new post, then updates it on the next', async () => {
      vi.mocked(postService.create).mockResolvedValue({ id: 'autosaved-1' } as never);
      vi.mocked(postService.update).mockResolvedValue({ id: 'autosaved-1' } as never);

      const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });
      act(() => {
        result.current.handleTitleChange('Draft post');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(30000);
      });

      expect(postService.create).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/posts/edit/autosaved-1', { replace: true });
      // The id assigned by autosave must not retrigger the load effect —
      // that would remount PageBuilder and lose in-progress block edits.
      expect(postService.getById).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(30000);
      });

      expect(postService.update).toHaveBeenCalledWith('autosaved-1', expect.any(FormData));
      expect(postService.create).toHaveBeenCalledTimes(1);
    });

    it('does not fire an overlapping autosave while one is still in flight', async () => {
      let resolveCreate!: (value: unknown) => void;
      vi.mocked(postService.create).mockReturnValue(
        new Promise((resolve) => {
          resolveCreate = resolve;
        }) as never
      );

      const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });
      act(() => {
        result.current.handleTitleChange('Draft post');
      });

      // First tick starts a create() that never resolves yet.
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await Promise.resolve();
      });
      expect(postService.create).toHaveBeenCalledTimes(1);

      // A second tick fires while the first is still pending — must be a no-op.
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await Promise.resolve();
      });
      expect(postService.create).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveCreate({ id: 'autosaved-1' });
        await Promise.resolve();
      });
    });

    it('does not clobber a gallery image added while an autosave request is in flight', async () => {
      let resolveCreate!: (value: unknown) => void;
      vi.mocked(postService.create).mockReturnValue(
        new Promise((resolve) => {
          resolveCreate = resolve;
        }) as never
      );

      const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });
      act(() => {
        result.current.handleTitleChange('Draft post');
      });

      await act(async () => {
        vi.advanceTimersByTime(30000);
        await Promise.resolve();
      });
      expect(postService.create).toHaveBeenCalledTimes(1);

      // User adds a gallery image while that request is still pending.
      act(() => {
        result.current.galleryProps.onImagesChange(['new-photo.jpg']);
      });

      await act(async () => {
        resolveCreate({ id: 'autosaved-1', gallery_images: [] });
        await Promise.resolve();
      });

      expect(result.current.galleryProps.images).toEqual(['new-photo.jpg']);
    });

    it('does not autosave to the server once the status is published', async () => {
      const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });
      act(() => {
        result.current.handleTitleChange('Draft post');
      });
      act(() => {
        result.current.setStatus('published');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(30000);
      });

      expect(postService.create).not.toHaveBeenCalled();
      expect(postService.update).not.toHaveBeenCalled();
    });

    it('autosaves an already-existing draft post to its own id', async () => {
      mockUseParams.mockReturnValue({ id: 'post-1' });
      vi.mocked(postService.getById).mockResolvedValue({
        post: {
          id: 'post-1',
          title: 'Existing draft',
          slug: 'existing-draft',
          status: 'draft',
          created_at: '',
          updated_at: '',
        },
        blocks: [],
      } as never);
      vi.mocked(postService.update).mockResolvedValue({ id: 'post-1' } as never);

      const { result } = renderHook(() => usePostForm(), { wrapper: createWrapper() });
      await act(async () => {
        await Promise.resolve();
      });
      act(() => {
        result.current.handleTitleChange('Existing draft, edited');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(30000);
      });

      expect(postService.update).toHaveBeenCalledWith('post-1', expect.any(FormData));
      expect(postService.create).not.toHaveBeenCalled();
    });
  });
});
