import { useEffect } from 'react';
import type { Post } from '@buro710/shared';

const findMeta = (name: string) =>
  document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);

/** Sets a meta tag and returns a function that restores its previous state. */
const setMetaTag = (name: string, content: string): (() => void) => {
  const existing = findMeta(name);
  if (existing) {
    const previous = existing.getAttribute('content');
    existing.setAttribute('content', content);
    return () => {
      if (previous === null) existing.removeAttribute('content');
      else existing.setAttribute('content', previous);
    };
  }

  const meta = document.createElement('meta');
  meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
  meta.setAttribute('content', content);
  document.head.appendChild(meta);
  return () => meta.remove();
};

const siteUrl = () =>
  ((import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin).replace(
    /\/$/,
    ''
  );

export function usePostSEO(post: Post | null) {
  useEffect(() => {
    if (!post) return;

    const seoTitle = post.seo_title || post.hero_title || post.title;
    const seoDescription = post.seo_description || post.hero_subtitle || '';
    const pageUrl = `${siteUrl()}/page/${post.slug}`;
    const ogImage = post.og_image_url || post.hero_image_url;

    document.title = seoTitle;

    const restores = [
      setMetaTag('description', seoDescription),
      setMetaTag('og:title', seoTitle),
      setMetaTag('og:description', seoDescription),
      setMetaTag('og:type', 'article'),
      setMetaTag('og:url', pageUrl),
      setMetaTag('twitter:title', seoTitle),
      setMetaTag('twitter:description', seoDescription),
    ];
    if (ogImage) {
      restores.push(setMetaTag('og:image', ogImage), setMetaTag('twitter:image', ogImage));
    }

    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = pageUrl;
    document.head.appendChild(canonical);

    return () => {
      restores.forEach((restore) => restore());
      canonical.remove();
      document.title = 'Buro 710';
    };
  }, [post]);
}
