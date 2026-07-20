import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PostHeroBlock from '../PostHeroBlock';
import type { Post } from '@buro710/shared';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    title: 'Fallback title',
    slug: 'fallback-title',
    status: 'published',
    created_at: '',
    updated_at: '',
    ...overrides,
  };
}

describe('PostHeroBlock', () => {
  it('renders nothing when there is neither a hero image nor any title', () => {
    const { container } = render(
      <PostHeroBlock post={makePost({ title: '', hero_title: undefined })} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders when only a hero image is present, with no title text', () => {
    const { container } = render(
      <PostHeroBlock post={makePost({ title: '', hero_image_url: 'hero.jpg' })} />
    );

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', 'hero.jpg');
  });

  it('falls back to the plain post title when hero_title is absent', () => {
    render(<PostHeroBlock post={makePost({ title: 'Plain title' })} />);

    expect(screen.getByText('Plain', { exact: false })).toBeInTheDocument();
  });

  it('prefers hero_title over the plain title', () => {
    render(<PostHeroBlock post={makePost({ title: 'Plain title', hero_title: 'Hero title' })} />);

    expect(screen.queryByText('Plain', { exact: false })).not.toBeInTheDocument();
  });

  it('renders every hero tag', () => {
    render(<PostHeroBlock post={makePost({ hero_tags: ['modern', 'minimal'] })} />);

    expect(screen.getByText('modern')).toBeInTheDocument();
    expect(screen.getByText('minimal')).toBeInTheDocument();
  });

  it('joins location and year with a comma when both are present', () => {
    render(<PostHeroBlock post={makePost({ hero_location: 'Kyiv', hero_year: '2026' })} />);

    expect(screen.getByText('Kyiv, 2026')).toBeInTheDocument();
  });

  it('shows only the year when location is absent', () => {
    render(<PostHeroBlock post={makePost({ hero_year: '2026' })} />);

    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('shows the subtitle and scroll button only when hero_subtitle is present', () => {
    const { rerender } = render(<PostHeroBlock post={makePost()} />);
    expect(screen.queryByText('Scroll to explore')).not.toBeInTheDocument();

    rerender(<PostHeroBlock post={makePost({ hero_subtitle: 'A short teaser' })} />);
    expect(screen.getByText('A short teaser')).toBeInTheDocument();
    expect(screen.getByText('Scroll to explore')).toBeInTheDocument();
  });
});
