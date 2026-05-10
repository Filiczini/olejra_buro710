import { useEffect } from 'react';
import type { Post } from '@buro710/shared';

const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    if (name.startsWith('og:')) {
      meta.setAttribute('property', name);
    } else {
      meta.setAttribute('name', name);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

export function usePostSEO(post: Post | null) {
  useEffect(() => {
    if (!post) return;

    const seoTitle = post.seo_title || post.hero_title || post.title;
    const seoDescription = post.seo_description || post.hero_subtitle || '';

    document.title = seoTitle;
    updateMetaTag('description', seoDescription);
    updateMetaTag('og:title', seoTitle);
    updateMetaTag('og:description', seoDescription);

    const ogImage = post.og_image_url || post.hero_image_url;
    if (ogImage) {
      updateMetaTag('og:image', ogImage);
    }

    return () => {
      document.title = 'Buro 710';
    };
  }, [post]);
}
