import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Post } from '@buro710/shared';

const { mockGetById } = vi.hoisted(() => ({ mockGetById: vi.fn() }));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'p1' }),
}));

vi.mock('../../../services/api', () => ({
  postService: { getById: mockGetById },
}));

vi.mock('../../../components/blocks/PostPageView', () => ({
  default: ({ post }: { post: Post }) => <div data-testid="page-view">{post.title}</div>,
}));

import PostPreviewPage from '../PostPreviewPage';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    title: 'Draft post',
    slug: 'draft-post',
    status: 'draft',
    created_at: '',
    updated_at: '',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PostPreviewPage', () => {
  it('renders a draft post with the preview badge', async () => {
    mockGetById.mockResolvedValue({ post: makePost(), blocks: [] });

    render(<PostPreviewPage />);

    expect(await screen.findByTestId('page-view')).toHaveTextContent('Draft post');
    expect(screen.getByText(/Режим перегляду · чернетка/)).toBeInTheDocument();
    expect(mockGetById).toHaveBeenCalledWith('p1');
  });

  it('shows not-found when the request fails', async () => {
    mockGetById.mockRejectedValue(new Error('404'));

    render(<PostPreviewPage />);

    expect(await screen.findByText('Сторінку не знайдено')).toBeInTheDocument();
  });
});
