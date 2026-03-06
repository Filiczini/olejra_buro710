import { z } from 'zod';

export const blockSchema = z.object({
  id: z.string().optional(),
  _tempId: z.string().optional(),
  type: z.enum(['text_full', 'image_full', 'text_image', 'image_text']),
  data: z.record(z.string(), z.unknown()),
  sort_order: z.number().optional(),
});

export const postCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Назва обов'язкова")
    .max(200, 'Назва не може бути довшою за 200 символів'),
  slug: z
    .string()
    .min(1, "Slug обов'язковий")
    .max(200, 'Slug не може бути довшим за 200 символів')
    .regex(/^[a-z0-9-]+$/, 'Slug може містити лише латинські літери, цифри та дефіси'),
  status: z.enum(['draft', 'published']).optional(),
  seo_title: z.string().max(60, 'SEO title не може бути довшим за 60 символів').optional(),
  seo_description: z
    .string()
    .max(160, 'SEO description не може бути довшим за 160 символів')
    .optional(),
  hero_title: z.string().max(200, 'Hero title не може бути довшим за 200 символів').optional(),
  hero_subtitle: z
    .string()
    .max(300, 'Hero subtitle не може бути довшим за 300 символів')
    .optional(),
  hero_tags: z.array(z.string()).max(15, 'Максимум 15 тегів').optional(),
  hero_location: z.string().max(200).optional(),
  hero_year: z.string().max(20).optional(),
  blocks: z.array(blockSchema).optional(),
});

export const postUpdateSchema = postCreateSchema.partial();

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
