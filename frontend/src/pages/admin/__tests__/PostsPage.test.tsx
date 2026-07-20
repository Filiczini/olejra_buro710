import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Post } from '@buro710/shared';

vi.mock('../../../services/api', () => ({
  postService: { getAll: vi.fn(), delete: vi.fn(), update: vi.fn() },
}));
vi.mock('../../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import PostsPage from '../PostsPage';
import { postService } from '../../../services/api';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    title: 'First post',
    slug: 'first-post',
    status: 'draft',
    created_at: '2026-07-18T10:00:00.000Z',
    updated_at: '2026-07-18T10:00:00.000Z',
    ...overrides,
  };
}

function renderPage(initialEntries: string[] = ['/admin/posts'], state?: unknown) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const entries = state ? [{ pathname: initialEntries[0], state }] : initialEntries;
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={entries}>
        <PostsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PostsPage', () => {
  it('renders fetched posts with a status badge', async () => {
    vi.mocked(postService.getAll).mockResolvedValue({
      data: [makePost({ title: 'First post', status: 'published' })],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderPage();

    await waitFor(() => expect(screen.getByText('First post')).toBeInTheDocument());
    expect(within(screen.getByRole('table')).getByText('Опубліковано')).toBeInTheDocument();
  });

  it('deletes a post after confirmation and removes its row', async () => {
    vi.mocked(postService.getAll).mockResolvedValue({
      data: [makePost()],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    vi.mocked(postService.delete).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => expect(screen.getByText('First post')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Видалити пост' }));
    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    await waitFor(() => expect(postService.delete).toHaveBeenCalledWith('p1'));
    await waitFor(() => expect(screen.queryByText('First post')).not.toBeInTheDocument());
  });

  it('shows an informative toast and restores the row when delete fails', async () => {
    vi.mocked(postService.getAll).mockResolvedValue({
      data: [makePost()],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    vi.mocked(postService.delete).mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { error: 'Admin access required' } },
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('First post')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Видалити пост' }));
    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));

    await waitFor(() => expect(screen.getByText('Admin access required')).toBeInTheDocument());
    expect(screen.getByText('First post')).toBeInTheDocument();
  });

  it('shows a success toast and clears navigation state after a redirected save', async () => {
    vi.mocked(postService.getAll).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    renderPage(['/admin/posts'], { saved: true });

    await waitFor(() => expect(screen.getByText('Пост збережено')).toBeInTheDocument());
  });

  it('bulk-deletes selected posts', async () => {
    vi.mocked(postService.getAll).mockResolvedValue({
      data: [makePost({ id: 'p1', title: 'Post one' }), makePost({ id: 'p2', title: 'Post two' })],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
    vi.mocked(postService.delete).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => expect(screen.getByText('Post one')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('checkbox', { name: 'Вибрати всі рядки' }));
    expect(screen.getByText(/обрано/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Видалити' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /^Видалити/ }));

    await waitFor(() => {
      expect(postService.delete).toHaveBeenCalledWith('p1');
      expect(postService.delete).toHaveBeenCalledWith('p2');
    });
    await waitFor(() => expect(screen.queryByText('Post one')).not.toBeInTheDocument());
  });
});
