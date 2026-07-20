import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Post, Block } from '@buro710/shared';

const { mockUsePublicPost } = vi.hoisted(() => ({ mockUsePublicPost: vi.fn() }));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ slug: 'my-post' }),
}));

vi.mock('../../hooks/usePublicPost', () => ({
  usePublicPost: mockUsePublicPost,
}));

vi.mock('../../components/layout/Header', () => ({
  default: ({ transparent }: { transparent: boolean }) => (
    <div data-testid="header">{transparent ? 'transparent' : 'solid'}</div>
  ),
}));
vi.mock('../../components/layout/Footer', () => ({ default: () => <div data-testid="footer" /> }));
vi.mock('../../components/blocks/PostHeroBlock', () => ({
  default: () => <div data-testid="hero-block" />,
}));
vi.mock('../../components/blocks/BlockRenderer', () => ({
  default: ({ blocks }: { blocks: Block[] }) => (
    <div data-testid="block-renderer">{blocks.length}</div>
  ),
}));
vi.mock('../../components/blocks/PostGalleryBlock', () => ({
  default: ({ images }: { images: string[] }) => (
    <div data-testid="gallery-block">{images.length}</div>
  ),
}));

import PostPage from '../PublicPostPage';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    title: 'My post',
    slug: 'my-post',
    status: 'published',
    created_at: '',
    updated_at: '',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PublicPostPage', () => {
  it('shows a loading spinner while the post is loading', () => {
    mockUsePublicPost.mockReturnValue({ post: null, blocks: [], loading: true, error: false });

    render(<PostPage />);

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('shows a not-found message on error', () => {
    mockUsePublicPost.mockReturnValue({ post: null, blocks: [], loading: false, error: true });

    render(<PostPage />);

    expect(screen.getByText('Сторінку не знайдено')).toBeInTheDocument();
  });

  it('shows a not-found message when there is no post, even without an explicit error', () => {
    mockUsePublicPost.mockReturnValue({ post: null, blocks: [], loading: false, error: false });

    render(<PostPage />);

    expect(screen.getByText('Сторінку не знайдено')).toBeInTheDocument();
  });

  it('renders a transparent header and the hero block when the post has hero content', () => {
    mockUsePublicPost.mockReturnValue({
      post: makePost({ hero_title: 'Welcome' }),
      blocks: [],
      loading: false,
      error: false,
    });

    render(<PostPage />);

    expect(screen.getByTestId('header')).toHaveTextContent('transparent');
    expect(screen.getByTestId('hero-block')).toBeInTheDocument();
  });

  it('renders a solid header and no hero block when the post has none', () => {
    mockUsePublicPost.mockReturnValue({
      post: makePost(),
      blocks: [],
      loading: false,
      error: false,
    });

    render(<PostPage />);

    expect(screen.getByTestId('header')).toHaveTextContent('solid');
    expect(screen.queryByTestId('hero-block')).not.toBeInTheDocument();
  });

  it('renders content blocks and the gallery when present', () => {
    mockUsePublicPost.mockReturnValue({
      post: makePost({ gallery_images: ['a.jpg', 'b.jpg'] }),
      blocks: [
        { id: 'b1', post_id: 'p1', type: 'text_full', data: {}, sort_order: 0, created_at: '' },
      ],
      loading: false,
      error: false,
    });

    render(<PostPage />);

    expect(screen.getByTestId('block-renderer')).toHaveTextContent('1');
    expect(screen.getByTestId('gallery-block')).toHaveTextContent('2');
  });

  it('shows the "content coming soon" fallback only when hero, blocks, and gallery are all absent', () => {
    mockUsePublicPost.mockReturnValue({
      post: makePost(),
      blocks: [],
      loading: false,
      error: false,
    });

    render(<PostPage />);

    expect(screen.getByText('Контент сторінки буде додано пізніше...')).toBeInTheDocument();
  });

  it('does not show the fallback once there is a hero, blocks, or a gallery', () => {
    mockUsePublicPost.mockReturnValue({
      post: makePost({ hero_title: 'Welcome' }),
      blocks: [],
      loading: false,
      error: false,
    });

    render(<PostPage />);

    expect(screen.queryByText('Контент сторінки буде додано пізніше...')).not.toBeInTheDocument();
  });
});
