import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { postService } from '../services/api';
import { logger } from '../lib/logger';
import Header from '../components/layout/Header';
import PostHeroBlock from '../components/blocks/PostHeroBlock';
import BlockRenderer from '../components/blocks/BlockRenderer';
import PostGalleryBlock from '../components/blocks/PostGalleryBlock';
import type { Post, Block } from '@buro710/shared';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPost = useCallback(async (postSlug: string) => {
    setLoading(true);
    setError(false);
    try {
      const result = await postService.getBySlug(postSlug);
      setPost(result.post);
      setBlocks(result.blocks);

      const seoTitle = result.post.seo_title || result.post.hero_title || result.post.title;
      const seoDescription = result.post.seo_description || result.post.hero_subtitle || '';

      document.title = seoTitle;
      updateMetaTag('description', seoDescription);
      updateMetaTag('og:title', seoTitle);
      updateMetaTag('og:description', seoDescription);

      const ogImage = result.post.og_image_url || result.post.hero_image_url;
      if (ogImage) {
        updateMetaTag('og:image', ogImage);
      }
    } catch (err) {
      logger.error('Error loading post', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
    return () => {
      document.title = 'Buro 710';
    };
  }, [slug, loadPost]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Icon icon="solar:spinner-linear" width={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Icon icon="solar:file-remove-linear" width={64} className="text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-700 mb-2">Сторінку не знайдено</h1>
        <p className="text-zinc-500">Запитана сторінка не існує або була видалена.</p>
      </div>
    );
  }

  const hasHero = Boolean(post.hero_image_url || post.hero_title);

  return (
    <div className="bg-white text-zinc-900 antialiased">
      <Header transparent={hasHero} />

      {hasHero && <PostHeroBlock post={post} />}

      <main className={hasHero ? '' : 'pt-16'}>
        {blocks.length > 0 && <BlockRenderer blocks={blocks} />}

        {post.gallery_images && post.gallery_images.length > 0 && (
          <PostGalleryBlock images={post.gallery_images} title={post.title} />
        )}

        {!hasHero &&
          blocks.length === 0 &&
          !(post.gallery_images && post.gallery_images.length > 0) && (
            <div className="max-w-5xl mx-auto px-4 py-24">
              <div className="text-center text-zinc-400">
                <Icon icon="solar:document-text-linear" width={48} className="mx-auto mb-4" />
                <p>Контент сторінки буде додано пізніше...</p>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
