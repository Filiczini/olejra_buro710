import { useState, useCallback } from 'react';
import { generateSlug } from '@buro710/shared';
import type { PostHeroFormData } from '../components/admin/PostHeroForm';
import type { PostStatus } from '../types/post';

export interface PostFormFields {
  title: string;
  slug: string;
  slugLocked: boolean;
  status: PostStatus;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  heroData: PostHeroFormData;
}

const INITIAL_HERO: PostHeroFormData = {
  hero_image_url: '',
  hero_title: '',
  hero_subtitle: '',
  hero_tags: [],
  hero_location: '',
  hero_year: '',
  heroImage: undefined,
};

export function usePostFormState(isEditing: boolean) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugLocked, setSlugLocked] = useState(isEditing);
  const [status, setStatus] = useState<PostStatus>('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [heroData, setHeroData] = useState<PostHeroFormData>(INITIAL_HERO);
  const [featured, setFeatured] = useState(false);

  // Updates title and regenerates slug while unlocked
  const updateTitle = useCallback(
    (value: string) => {
      setTitle(value);
      setSlug((prev) => (slugLocked ? prev : generateSlug(value)));
    },
    [slugLocked]
  );

  // Updates slug and locks it
  const updateSlug = useCallback((value: string) => {
    setSlug(value);
    setSlugLocked(true);
  }, []);

  const unlockSlug = useCallback(() => {
    setSlugLocked(false);
    setTitle((t) => {
      setSlug(generateSlug(t));
      return t;
    });
  }, []);

  const lockSlug = useCallback(() => setSlugLocked(true), []);

  // Batch-apply fields — used by loadPost and restoreDraft
  const applyFields = useCallback((fields: Partial<PostFormFields>) => {
    if (fields.title !== undefined) setTitle(fields.title);
    if (fields.slug !== undefined) setSlug(fields.slug);
    if (fields.slugLocked !== undefined) setSlugLocked(fields.slugLocked);
    if (fields.status !== undefined) setStatus(fields.status);
    if (fields.seoTitle !== undefined) setSeoTitle(fields.seoTitle);
    if (fields.seoDescription !== undefined) setSeoDescription(fields.seoDescription);
    if (fields.featured !== undefined) setFeatured(fields.featured);
    if (fields.heroData !== undefined) setHeroData(fields.heroData);
  }, []);

  return {
    title,
    slug,
    slugLocked,
    status,
    seoTitle,
    seoDescription,
    heroData,
    featured,
    setStatus,
    setSeoTitle,
    setSeoDescription,
    setHeroData,
    setFeatured,
    updateTitle,
    updateSlug,
    unlockSlug,
    lockSlug,
    applyFields,
  };
}
