import { z } from "zod";

export const blockResponseSchema = z.object({
  id: z.string(),
  post_id: z.string(),
  type: z.enum([
    "text_full",
    "image_full",
    "text_image",
    "image_text",
    "three_images",
  ]),
  data: z.record(z.string(), z.unknown()),
  sort_order: z.number(),
  created_at: z.string(),
});

export const postResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean().optional().nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  og_image_url: z.string().optional().nullable(),
  hero_image_url: z.string().optional().nullable(),
  hero_title: z.string().optional().nullable(),
  hero_subtitle: z.string().optional().nullable(),
  hero_tags: z.array(z.string()).optional().nullable(),
  hero_location: z.string().optional().nullable(),
  hero_year: z.string().optional().nullable(),
  gallery_images: z.array(z.string()).optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
});

export const paginatedPostResponseSchema = z.object({
  data: z.array(postResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const postWithBlocksResponseSchema = z.object({
  post: postResponseSchema,
  blocks: z.array(blockResponseSchema),
});

export const contactResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  message: z.string(),
  telegram_sent: z.boolean().optional().nullable(),
  telegram_message_id: z.string().optional().nullable(),
  created_at: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const messageResponseSchema = z.object({
  message: z.string(),
});
