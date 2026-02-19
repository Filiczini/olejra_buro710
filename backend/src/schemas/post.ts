import { z } from 'zod';

export const blockSchema = z.object({
  id: z.string().optional(),
  _tempId: z.string().optional(),
  type: z.enum(['text_full', 'image_full', 'text_image', 'image_text']),
  data: z.record(z.string(), z.unknown()),
  sort_order: z.number().optional(),
});

export const postCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be at most 200 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  status: z.enum(['draft', 'published']).optional(),
  seo_title: z.string().max(200, 'SEO title must be at most 200 characters').optional(),
  seo_description: z.string().max(500, 'SEO description must be at most 500 characters').optional(),
  hero_title: z.string().max(200).optional(),
  hero_subtitle: z.string().max(300).optional(),
  hero_tags: z.array(z.string()).max(15, 'Maximum 15 tags allowed').optional(),
  hero_location: z.string().max(200).optional(),
  hero_year: z.string().max(20).optional(),
  blocks: z.array(blockSchema).optional(),
});

export const postUpdateSchema = postCreateSchema.partial();

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
