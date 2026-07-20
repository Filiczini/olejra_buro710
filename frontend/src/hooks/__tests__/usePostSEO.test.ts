import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import type { Post } from '@buro710/shared';
import { usePostSEO } from '../usePostSEO';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'post-1',
    title: 'Fallback title',
    slug: 'fallback-title',
    status: 'published',
    created_at: '2026-07-18T10:00:00.000Z',
    updated_at: '2026-07-18T10:00:00.000Z',
    ...overrides,
  };
}

function metaContent(name: string): string | null {
  return (
    document
      .querySelector(`meta[name="${name}"], meta[property="${name}"]`)
      ?.getAttribute('content') ?? null
  );
}

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('meta').forEach((el) => el.remove());
  document.title = 'Buro 710';
});

describe('usePostSEO', () => {
  it('does nothing when there is no post', () => {
    document.title = 'Untouched';

    renderHook(() => usePostSEO(null));

    expect(document.title).toBe('Untouched');
    expect(metaContent('description')).toBeNull();
  });

  it('prefers seo_title/seo_description, falling back through hero fields to title', () => {
    renderHook(() =>
      usePostSEO(makePost({ seo_title: 'SEO title', seo_description: 'SEO description' }))
    );

    expect(document.title).toBe('SEO title');
    expect(metaContent('description')).toBe('SEO description');
    expect(metaContent('og:title')).toBe('SEO title');
  });

  it('falls back to hero_title/hero_subtitle when seo fields are absent', () => {
    renderHook(() =>
      usePostSEO(makePost({ hero_title: 'Hero title', hero_subtitle: 'Hero subtitle' }))
    );

    expect(document.title).toBe('Hero title');
    expect(metaContent('description')).toBe('Hero subtitle');
  });

  it('falls back all the way to the plain title when seo and hero fields are absent', () => {
    renderHook(() => usePostSEO(makePost({ title: 'Plain title' })));

    expect(document.title).toBe('Plain title');
    expect(metaContent('description')).toBe('');
  });

  it('sets og:image from og_image_url, preferring it over hero_image_url', () => {
    renderHook(() => usePostSEO(makePost({ og_image_url: 'og.jpg', hero_image_url: 'hero.jpg' })));

    expect(metaContent('og:image')).toBe('og.jpg');
  });

  it('falls back to hero_image_url for og:image when og_image_url is absent', () => {
    renderHook(() => usePostSEO(makePost({ hero_image_url: 'hero.jpg' })));

    expect(metaContent('og:image')).toBe('hero.jpg');
  });

  it('does not create an og:image tag when neither image is set', () => {
    renderHook(() => usePostSEO(makePost()));

    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
  });

  it('reuses an existing meta tag instead of creating a duplicate', () => {
    const { rerender } = renderHook(({ post }) => usePostSEO(post), {
      initialProps: { post: makePost({ seo_description: 'First' }) },
    });
    rerender({ post: makePost({ seo_description: 'Second' }) });

    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(metaContent('description')).toBe('Second');
  });

  it('resets document.title back to the site default on unmount', () => {
    const { unmount } = renderHook(() => usePostSEO(makePost({ title: 'Some post' })));
    expect(document.title).toBe('Some post');

    unmount();

    expect(document.title).toBe('Buro 710');
  });
});
