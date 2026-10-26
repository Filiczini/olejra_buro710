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
  document.head.querySelectorAll('meta, link[rel="canonical"]').forEach((el) => el.remove());
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

  it('sets canonical, og:url and twitter tags for the post page', () => {
    renderHook(() =>
      usePostSEO(makePost({ slug: 'my-post', seo_title: 'T', hero_image_url: 'hero.jpg' }))
    );

    const url = `${window.location.origin}/page/my-post`;
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(url);
    expect(metaContent('og:url')).toBe(url);
    expect(metaContent('og:type')).toBe('article');
    expect(metaContent('twitter:title')).toBe('T');
    expect(metaContent('twitter:image')).toBe('hero.jpg');
  });

  it('removes the canonical link on unmount', () => {
    const { unmount } = renderHook(() => usePostSEO(makePost()));
    expect(document.querySelector('link[rel="canonical"]')).not.toBeNull();

    unmount();

    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('restores pre-existing meta tags and removes added ones on unmount', () => {
    const existing = document.createElement('meta');
    existing.setAttribute('property', 'og:title');
    existing.setAttribute('content', 'Site default');
    document.head.appendChild(existing);

    const { unmount } = renderHook(() =>
      usePostSEO(makePost({ seo_title: 'Post title', hero_image_url: 'hero.jpg' }))
    );
    expect(metaContent('og:title')).toBe('Post title');
    expect(metaContent('og:image')).toBe('hero.jpg');

    unmount();

    expect(metaContent('og:title')).toBe('Site default');
    expect(metaContent('og:image')).toBeNull();
    expect(metaContent('og:url')).toBeNull();
    expect(metaContent('twitter:title')).toBeNull();
  });
});
