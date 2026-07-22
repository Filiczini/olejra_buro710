import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/api', () => ({
  postService: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { usePostSubmit, type SubmitValues } from '../usePostSubmit';
import { postService } from '../../services/api';

function values(overrides: Partial<SubmitValues> = {}): SubmitValues {
  return {
    title: 'Post title',
    slug: 'post-title',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    featured: false,
    heroData: {},
    ogImageFile: null,
    blocksData: [],
    blockFiles: [],
    galleryImages: [],
    galleryNewFiles: [],
    isEditing: false,
    ...overrides,
  };
}

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

function makeCallbacks() {
  return {
    validate: vi.fn(() => true),
    setErrors: vi.fn(),
    scrollToFirstError: vi.fn(),
    showToast: vi.fn(),
    clearDirty: vi.fn(),
    draftDismiss: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePostSubmit', () => {
  it('does not call the API when client-side validation fails', async () => {
    const { result } = renderHook(() => usePostSubmit(), { wrapper: createWrapper() });
    const callbacks = makeCallbacks();
    callbacks.validate.mockReturnValue(false);

    await act(async () => {
      await result.current.submit(values(), callbacks);
    });

    expect(postService.create).not.toHaveBeenCalled();
    expect(callbacks.showToast).not.toHaveBeenCalled();
    expect(result.current.saving).toBe(false);
  });

  it('creates a new post and navigates away on success', async () => {
    vi.mocked(postService.create).mockResolvedValue({} as never);
    const { result } = renderHook(() => usePostSubmit(), { wrapper: createWrapper() });
    const callbacks = makeCallbacks();

    await act(async () => {
      await result.current.submit(values({ isEditing: false }), callbacks);
    });

    expect(postService.create).toHaveBeenCalledWith(expect.any(FormData));
    expect(callbacks.clearDirty).toHaveBeenCalled();
    expect(callbacks.draftDismiss).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts', { state: { saved: true } });
  });

  it('updates the existing post by id when editing', async () => {
    vi.mocked(postService.update).mockResolvedValue({} as never);
    const { result } = renderHook(() => usePostSubmit(), { wrapper: createWrapper() });
    const callbacks = makeCallbacks();

    await act(async () => {
      await result.current.submit(values({ isEditing: true, id: 'post-123' }), callbacks);
    });

    expect(postService.update).toHaveBeenCalledWith('post-123', expect.any(FormData));
  });

  it('shows a session-expired toast on a 401 response', async () => {
    vi.mocked(postService.create).mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    });
    const { result } = renderHook(() => usePostSubmit(), { wrapper: createWrapper() });
    const callbacks = makeCallbacks();

    await act(async () => {
      await result.current.submit(values(), callbacks);
    });

    expect(callbacks.showToast).toHaveBeenCalledWith('Сесія закінчилась — увійдіть знову', 'error');
    expect(callbacks.setErrors).toHaveBeenCalledWith({
      submit: 'Сесія закінчилась — увійдіть знову',
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/admin/posts', { state: { saved: true } });
  });

  it('surfaces the backend permission message on a 403 response', async () => {
    vi.mocked(postService.create).mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { error: 'Editor access required' } },
    });
    const { result } = renderHook(() => usePostSubmit(), { wrapper: createWrapper() });
    const callbacks = makeCallbacks();

    await act(async () => {
      await result.current.submit(values(), callbacks);
    });

    expect(callbacks.showToast).toHaveBeenCalledWith('Editor access required', 'error');
  });

  it('maps a duplicate slug error to the slug field specifically', async () => {
    vi.mocked(postService.create).mockRejectedValue({
      response: { data: { field: 'slug', error: 'Slug already exists' } },
    });
    const { result } = renderHook(() => usePostSubmit(), { wrapper: createWrapper() });
    const callbacks = makeCallbacks();

    await act(async () => {
      await result.current.submit(values(), callbacks);
    });

    expect(callbacks.setErrors).toHaveBeenCalledWith({ slug: 'Такий URL вже існує' });
    expect(callbacks.scrollToFirstError).toHaveBeenCalled();
  });

  it('maps per-field validation details from the backend onto form errors', async () => {
    vi.mocked(postService.create).mockRejectedValue({
      response: {
        data: {
          details: [
            { field: 'title', message: 'Title too short' },
            { field: 'slug', message: 'Slug invalid' },
          ],
        },
      },
    });
    const { result } = renderHook(() => usePostSubmit(), { wrapper: createWrapper() });
    const callbacks = makeCallbacks();

    await act(async () => {
      await result.current.submit(values(), callbacks);
    });

    expect(callbacks.setErrors).toHaveBeenCalledWith({
      title: 'Title too short',
      slug: 'Slug invalid',
    });
  });

  it('leaves saving false again after the request settles, on both success and failure', async () => {
    vi.mocked(postService.create).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => usePostSubmit(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.submit(values(), makeCallbacks());
    });

    expect(result.current.saving).toBe(false);
  });
});
