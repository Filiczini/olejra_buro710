import { z } from "zod";
import type { BlockType } from "../types/block.js";

const textFullDataSchema = z.object({
  content: z.string(),
  label: z.string().optional(),
  area: z.string().optional(),
  months: z.string().optional(),
  year: z.string().optional(),
});

const imageFullDataSchema = z.object({
  image_url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

const textImageDataSchema = z.object({
  text: z.string().optional(),
  image_url: z.string().optional(),
  image_alt: z.string().optional(),
  icon: z.string().optional(),
  label: z.string().optional(),
  title: z.string().optional(),
  features: z.array(z.string()).optional(),
});

const threeImagesDataSchema = z.object({
  images: z.array(
    z.object({
      url: z.string(),
      alt: z.string(),
    }),
  ),
});

export const blockDataSchema = z.union([
  textFullDataSchema,
  imageFullDataSchema,
  textImageDataSchema,
  threeImagesDataSchema,
]);

// z.object() strips unknown keys by default, so the union above silently matches
// the first schema whose *required* fields happen to be present (e.g. imageFullDataSchema
// matches any block with an image_url, discarding text_image's `text` field). Parse by the
// block's own `type` instead of guessing from shape.
const blockDataSchemaByType: Record<BlockType, z.ZodTypeAny> = {
  text_full: textFullDataSchema,
  image_full: imageFullDataSchema,
  text_image: textImageDataSchema,
  image_text: textImageDataSchema,
  three_images: threeImagesDataSchema,
};

export function parseBlockData(
  type: BlockType,
  data: unknown,
): z.infer<typeof blockDataSchema> {
  return blockDataSchemaByType[type].parse(data) as z.infer<
    typeof blockDataSchema
  >;
}

export const blockSchema = z.object({
  id: z.string().optional(),
  _tempId: z.string().optional(),
  type: z.enum([
    "text_full",
    "image_full",
    "text_image",
    "image_text",
    "three_images",
  ]),
  data: z.record(z.string(), z.unknown()),
  sort_order: z.number().optional(),
});

export const postCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Назва обов'язкова")
    .max(200, "Назва не може бути довшою за 200 символів"),
  slug: z
    .string()
    .min(1, "Slug обов'язковий")
    .max(200, "Slug не може бути довшим за 200 символів")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug може містити лише латинські літери, цифри та дефіси",
    )
    .optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
  seo_title: z
    .string()
    .max(60, "SEO title не може бути довшим за 60 символів")
    .optional(),
  seo_description: z
    .string()
    .max(160, "SEO description не може бути довшим за 160 символів")
    .optional(),
  hero_title: z
    .string()
    .max(200, "Hero title не може бути довшим за 200 символів")
    .optional(),
  hero_subtitle: z
    .string()
    .max(300, "Hero subtitle не може бути довшим за 300 символів")
    .optional(),
  hero_tags: z
    .array(z.string().max(20, "Тег не може бути довшим за 20 символів"))
    .max(15, "Максимум 15 тегів")
    .optional(),
  hero_location: z.string().max(200).optional(),
  // Must match DB column varchar(10)
  hero_year: z.string().max(10).optional(),
  blocks: z.array(blockSchema).optional(),
});

export const postUpdateSchema = postCreateSchema.partial();

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
