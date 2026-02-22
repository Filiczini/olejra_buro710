/**
 * Validation utilities for Posts API
 */

import type { PostStatus } from '../../types/post';

export interface PostBody {
  title?: string;
  slug?: string;
  status?: PostStatus;
  seo_title?: string;
  seo_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_tags?: string;
  hero_location?: string;
  hero_year?: string;
  gallery_images?: string;
  blocks?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

const VALIDATION_LIMITS = {
  title: { minLength: 1, maxLength: 200 },
  slug: { maxLength: 200 },
  seoTitle: { maxLength: 60 },
  seoDescription: { maxLength: 160 },
  heroTitle: { maxLength: 200 },
  heroSubtitle: { maxLength: 300 },
};

export const validatePostInput = (data: PostBody, isCreate: boolean): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { title, slug, seo_title, seo_description, hero_title, hero_subtitle } = data;

  if (isCreate && !title) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (title !== undefined) {
    if (title.length < VALIDATION_LIMITS.title.minLength) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (title.length > VALIDATION_LIMITS.title.maxLength) {
      errors.push({
        field: 'title',
        message: `Title must be at most ${VALIDATION_LIMITS.title.maxLength} characters`,
      });
    }
  }

  if (slug && slug.length > VALIDATION_LIMITS.slug.maxLength) {
    errors.push({
      field: 'slug',
      message: `Slug must be at most ${VALIDATION_LIMITS.slug.maxLength} characters`,
    });
  }

  if (seo_title && seo_title.length > VALIDATION_LIMITS.seoTitle.maxLength) {
    errors.push({
      field: 'seo_title',
      message: `SEO title must be at most ${VALIDATION_LIMITS.seoTitle.maxLength} characters`,
    });
  }

  if (seo_description && seo_description.length > VALIDATION_LIMITS.seoDescription.maxLength) {
    errors.push({
      field: 'seo_description',
      message: `SEO description must be at most ${VALIDATION_LIMITS.seoDescription.maxLength} characters`,
    });
  }

  if (hero_title && hero_title.length > VALIDATION_LIMITS.heroTitle.maxLength) {
    errors.push({
      field: 'hero_title',
      message: `Hero title must be at most ${VALIDATION_LIMITS.heroTitle.maxLength} characters`,
    });
  }

  if (hero_subtitle && hero_subtitle.length > VALIDATION_LIMITS.heroSubtitle.maxLength) {
    errors.push({
      field: 'hero_subtitle',
      message: `Hero subtitle must be at most ${VALIDATION_LIMITS.heroSubtitle.maxLength} characters`,
    });
  }

  return errors;
};

export const parseJsonField = <T>(value: string | undefined, fieldName: string): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Invalid ${fieldName} format`);
  }
};
