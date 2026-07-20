import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PostHeroPreview from '../PostHeroPreview';
import type { PostHeroFormData } from '../../../types/post';

function data(overrides: Partial<PostHeroFormData> = {}): PostHeroFormData {
  return { ...overrides };
}

beforeEach(() => {
  vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock') });
});

describe('PostHeroPreview', () => {
  it('shows the empty-state message when there is no image and no title', () => {
    render(<PostHeroPreview data={data()} title="" />);

    expect(screen.getByText("Заповніть форму для перегляду прев'ю")).toBeInTheDocument();
  });

  it('renders the title-only hero on a plain dark background, without an image', () => {
    render(<PostHeroPreview data={data({ hero_title: 'Hero title' })} title="" />);

    expect(screen.getByText('Hero title')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText("Заповніть форму для перегляду прев'ю")).not.toBeInTheDocument();
  });

  it('falls back to the post title when hero_title is empty', () => {
    render(<PostHeroPreview data={data()} title="Plain post title" />);

    expect(screen.getByText('Plain post title')).toBeInTheDocument();
  });

  it('prefers hero_title over the plain post title', () => {
    render(<PostHeroPreview data={data({ hero_title: 'Hero title' })} title="Plain post title" />);

    expect(screen.getByText('Hero title')).toBeInTheDocument();
    expect(screen.queryByText('Plain post title')).not.toBeInTheDocument();
  });

  it('shows hero_location/hero_year even without any tags', () => {
    render(
      <PostHeroPreview
        data={data({ hero_title: 'T', hero_location: 'Kyiv', hero_year: '2026' })}
        title=""
      />
    );

    expect(screen.getByText('Kyiv, 2026')).toBeInTheDocument();
  });

  it('shows tags even without a location or year', () => {
    render(<PostHeroPreview data={data({ hero_title: 'T', hero_tags: ['modern'] })} title="" />);

    expect(screen.getByText('modern')).toBeInTheDocument();
  });

  it('shows the subtitle and scroll-to-explore hint only together', () => {
    const { rerender } = render(<PostHeroPreview data={data({ hero_title: 'T' })} title="" />);
    expect(screen.queryByText('Scroll to explore')).not.toBeInTheDocument();

    rerender(
      <PostHeroPreview data={data({ hero_title: 'T', hero_subtitle: 'A teaser' })} title="" />
    );
    expect(screen.getByText('A teaser')).toBeInTheDocument();
    expect(screen.getByText('Scroll to explore')).toBeInTheDocument();
  });

  it('renders the hero image when provided', () => {
    render(
      <PostHeroPreview data={data({ hero_image_url: 'https://x.test/a.jpg' })} title="Fallback" />
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://x.test/a.jpg');
  });
});
