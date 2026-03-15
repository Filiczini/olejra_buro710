/**
 * Validation utilities for Posts API
 */

import type { PostStatus } from '../../types/post';
import { postUpdateSchema } from '@buro710/shared';

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
  hero_image_url?: string;
  og_image_url?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePostInput = (data: PostBody, isCreate: boolean): ValidationError[] => {
  const dataToValidate: Record<string, unknown> = {};

  if (data.title !== undefined) dataToValidate.title = data.title;
  if (data.slug !== undefined) dataToValidate.slug = data.slug;
  if (data.status !== undefined) dataToValidate.status = data.status;
  if (data.seo_title !== undefined) dataToValidate.seo_title = data.seo_title;
  if (data.seo_description !== undefined) dataToValidate.seo_description = data.seo_description;
  if (data.hero_title !== undefined) dataToValidate.hero_title = data.hero_title;
  if (data.hero_subtitle !== undefined) dataToValidate.hero_subtitle = data.hero_subtitle;
  if (data.hero_location !== undefined) dataToValidate.hero_location = data.hero_location;
  if (data.hero_year !== undefined) dataToValidate.hero_year = data.hero_year;
  if (data.hero_tags) {
    try {
      dataToValidate.hero_tags = JSON.parse(data.hero_tags);
    } catch {
      /* will be validated as string */
    }
  }

  // Use postUpdateSchema (all fields optional) since we only validate
  // fields that are actually present. Required field checks (e.g. title)
  // are handled by the route handlers.
  const schema = postUpdateSchema;
  const result = schema.safeParse(dataToValidate);
  if (!result.success) {
    return result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  return [];
};

export const parseJsonField = <T>(value: string | undefined, fieldName: string): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Invalid ${fieldName} format`);
  }
};
