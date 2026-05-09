import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../lib/logger';
import { postService } from '../services/api';
import type { PostStatus } from '@buro710/shared';
import type { EditBlock } from '../types/block';
import type { PostFormFields } from './usePostFormState';

export interface LoadCallbacks {
  applyFields: (fields: Partial<PostFormFields>) => void;
  setInitialBlocks: (blocks: EditBlock[]) => void;
  setGalleryImages: (images: string[]) => void;
  setBlocksData: (blocks: EditBlock[]) => void;
  clearDirty: () => void;
}

export function usePostLoad() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (postId: string, callbacks: LoadCallbacks) => {
      setLoading(true);
      try {
        const { post, blocks: lb } = await postService.getById(postId);
        callbacks.applyFields({
          title: post.title,
          slug: post.slug,
          slugLocked: true,
          status: post.status as PostStatus,
          seoTitle: post.seo_title || '',
          seoDescription: post.seo_description || '',
          featured: post.featured || false,
          heroData: {
            hero_image_url: post.hero_image_url || '',
            hero_title: post.hero_title || '',
            hero_subtitle: post.hero_subtitle || '',
            hero_tags: post.hero_tags || [],
            hero_location: post.hero_location || '',
            hero_year: post.hero_year || '',
            heroImage: undefined,
          },
        });
        callbacks.setInitialBlocks(lb);
        callbacks.setGalleryImages(post.gallery_images || []);
        callbacks.setBlocksData(
          lb.map((b, i) => ({
            id: b.id,
            type: b.type,
            data: b.data,
            sort_order: i,
          }))
        );
        callbacks.clearDirty();
      } catch (error) {
        logger.error('Error loading post', error);
        navigate('/admin/posts');
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  return { loading, load };
}
