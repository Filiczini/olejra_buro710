/**
 * Validation utilities for Posts API (shared between internal and external routes)
 */

import type { PostStatus } from '../../types/post';
import { postUpdateSchema } from '@buro710/shared';

export interface PostBody {
  title?: string;
  slug?: string;
  status?: PostStatus | 'draft' | 'published';
  featured?: string;
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

  // Always use postUpdateSchema (all fields optional) since we only validate
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

export interface RawBlock {
  id?: string;
  _tempId?: string;
  type: string;
  data: Record<string, unknown>;
  sort_order?: number;
}

export interface ProcessedBlock {
  id?: string;
  type: string;
  data: Record<string, unknown>;
  sort_order: number;
}

export const parseBlocksJson = (blocksJson: string | undefined): RawBlock[] => {
  if (!blocksJson) return [];

  const parsed = parseJsonField<RawBlock[]>(blocksJson, 'blocks');
  return parsed || [];
};

export const cleanBlockData = (block: RawBlock, index: number): ProcessedBlock => {
  const data = { ...block.data };
  delete data._hasNewImage;
  delete data._newImageSlots;

  return {
    id: block.id,
    type: block.type,
    data,
    sort_order: block.sort_order ?? index,
  };
};

export const processBlocks = (blocksJson: string | undefined): ProcessedBlock[] => {
  return parseBlocksJson(blocksJson).map(cleanBlockData);
};

const IMAGE_BLOCK_TYPES = ['image_full', 'text_image', 'image_text'];

export interface BlockImageUpload {
  sort_order: number;
  file: Express.Multer.File;
  imageSlot?: number;
}

export const extractBlockImageUploads = (
  rawBlocks: RawBlock[],
  imageFiles: Express.Multer.File[]
): { blocks: ProcessedBlock[]; uploads: BlockImageUpload[] } => {
  const uploads: BlockImageUpload[] = [];
  let fileIndex = 0;

  const blocks = rawBlocks.map((block, index) => {
    const data = { ...block.data };

    if (block.type === 'three_images') {
      const newImageSlots = (data._newImageSlots as number[]) || [];
      for (const slot of newImageSlots) {
        if (imageFiles[fileIndex]) {
          uploads.push({ sort_order: index, file: imageFiles[fileIndex], imageSlot: slot });
          fileIndex++;
        }
      }
    } else if (IMAGE_BLOCK_TYPES.includes(block.type) && data._hasNewImage === true) {
      if (imageFiles[fileIndex]) {
        uploads.push({ sort_order: index, file: imageFiles[fileIndex] });
        fileIndex++;
      }
    }

    delete data._hasNewImage;
    delete data._newImageSlots;

    return {
      id: block.id,
      type: block.type,
      data,
      sort_order: block.sort_order ?? index,
    };
  });

  return { blocks, uploads };
};
