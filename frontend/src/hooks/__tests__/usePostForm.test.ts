import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

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

describe('usePostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({});
    mockSafeParse.mockReturnValue({ success: true, data: {} } as never);
  });

  it('initializes with default state for new post', () => {
    const { result } = renderHook(() => usePostForm());

    expect(result.current.isEditing).toBe(false);
    expect(result.current.title).toBe('');
    expect(result.current.slug).toBe('');
    expect(result.current.slugLocked).toBe(false);
    expect(result.current.status).toBe('draft');
    expect(result.current.loading).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.errors).toEqual({});
    expect(result.current.featured).toBe(false);
  });

  it('slugLocked is true initially when editing', () => {
    mockUseParams.mockReturnValue({ id: 'post-123' });
    vi.mocked(postService.getById).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePostForm());

    expect(result.current.slugLocked).toBe(true);
  });

  it('sets isEditing to true when id param exists', () => {
    mockUseParams.mockReturnValue({ id: 'post-123' });

    vi.mocked(postService.getById).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePostForm());

    expect(result.current.isEditing).toBe(true);
  });

  it('handleTitleChange updates title and generates slug for new post', () => {
    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.handleTitleChange('My New Post');
    });

    expect(result.current.title).toBe('My New Post');
    expect(result.current.slug).toBe('my-new-post');
  });

  it('handleTitleChange continuously updates slug while unlocked', () => {
    const { result } = renderHook(() => usePostForm());

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

    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.handleTitleChange('Updated Title');
    });

    expect(result.current.title).toBe('Updated Title');
    expect(result.current.slug).toBe('');
  });

  it('handleTitleChange does not overwrite manually set slug', () => {
    const { result } = renderHook(() => usePostForm());

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
    const { result } = renderHook(() => usePostForm());

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
    const { result } = renderHook(() => usePostForm());

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
    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.setStatus('published');
    });

    expect(result.current.status).toBe('published');
  });

  it('setFeatured toggles featured state', () => {
    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.setFeatured(true);
    });

    expect(result.current.featured).toBe(true);
  });

  it('setSeoTitle and setSeoDescription update SEO fields', () => {
    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.setSeoTitle('SEO Title');
      result.current.setSeoDescription('SEO Description');
    });

    expect(result.current.seoTitle).toBe('SEO Title');
    expect(result.current.seoDescription).toBe('SEO Description');
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

    const { result } = renderHook(() => usePostForm());

    await act(async () => {
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.errors).toEqual({
      title: 'Title is required',
      slug: 'Slug is required',
    });
    expect(postService.create).not.toHaveBeenCalled();
  });

  it('handleSubmit creates new post on valid data', async () => {
    vi.mocked(postService.create).mockResolvedValue({} as never);

    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.handleTitleChange('Test Post');
    });

    await act(async () => {
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(fakeEvent);
    });

    expect(postService.create).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts');
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

    const { result } = renderHook(() => usePostForm());

    // Wait for loadPost to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(fakeEvent);
    });

    expect(postService.update).toHaveBeenCalledWith('post-123', expect.any(FormData));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts');
  });

  it('handleSubmit sets error on save failure', async () => {
    vi.mocked(postService.create).mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => usePostForm());

    await act(async () => {
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.errors).toEqual({ submit: 'Помилка збереження посту' });
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

    const { result } = renderHook(() => usePostForm());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.title).toBe('Loaded Post');
    expect(result.current.slug).toBe('loaded-post');
    expect(result.current.status).toBe('published');
    expect(result.current.featured).toBe(true);
    expect(result.current.seoTitle).toBe('SEO');
    expect(result.current.heroData.hero_title).toBe('Hero');
    expect(result.current.loading).toBe(false);
  });

  it('navigates away on load error', async () => {
    mockUseParams.mockReturnValue({ id: 'bad-id' });
    vi.mocked(postService.getById).mockRejectedValue(new Error('Not found'));

    renderHook(() => usePostForm());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts');
  });
});
