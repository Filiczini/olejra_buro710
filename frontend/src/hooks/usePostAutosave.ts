import { useCallback } from 'react';
import { postService } from '../services/api';
import { buildPostFormData } from '../lib/buildPostFormData';
import { logger } from '../lib/logger';
import type { Post, PostStatus } from '@buro710/shared';
import type { PostHeroFormData } from '../types/post';

export interface AutosaveSnapshot {
  title: string;
  slug: string;
  status: PostStatus;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  heroData: PostHeroFormData;
  ogImageFile: File | null;
  galleryImages: string[];
  galleryNewFiles: File[];
}

/**
 * Server-side draft autosave — metadata/hero/SEO/gallery only, never block
 * content. Blocks stay covered by the existing localStorage draft; syncing
 * them here would require reconciling temp block ids into the live
 * PageBuilder, which can't be done without remounting it mid-edit.
 */
export function usePostAutosave(id: string | undefined) {
  const autosave = useCallback(
    async (snapshot: AutosaveSnapshot): Promise<Post | null> => {
      if (snapshot.status !== 'draft') return null;

      const formData = buildPostFormData({
        title: snapshot.title,
        slug: snapshot.slug,
        status: snapshot.status,
        seoTitle: snapshot.seoTitle,
        seoDescription: snapshot.seoDescription,
        featured: snapshot.featured,
        heroData: snapshot.heroData,
        ogImageFile: snapshot.ogImageFile,
        blocksData: [],
        blockFiles: [],
        galleryImages: snapshot.galleryImages,
        galleryNewFiles: snapshot.galleryNewFiles,
        includeBlocks: false,
      });

      try {
        return id ? await postService.update(id, formData) : await postService.create(formData);
      } catch (error) {
        logger.error('Draft autosave failed', error);
        return null;
      }
    },
    [id]
  );

  return { autosave };
}
