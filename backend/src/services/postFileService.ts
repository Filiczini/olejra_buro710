import { storageService } from './storageService';
import type { BlockData, UpsertBlockInput } from '@buro710/shared';

export interface ProcessImageOptions {
  file?: Express.Multer.File;
  existingUrl?: string | null;
  urlFromBody?: string | undefined;
  folder: string;
}

export interface BlockImageUpload {
  sort_order: number;
  file: Express.Multer.File;
  imageSlot?: number;
}

export const postFileService = {
  /**
   * Process a single image upload: if a new file is provided, upload it (and optionally
   * delete the old one). If no file but a URL is provided from the body, use that.
   * Otherwise keep the existing URL.
   */
  processImage: async (options: ProcessImageOptions): Promise<string | undefined> => {
    const { file, existingUrl, urlFromBody, folder } = options;

    if (file) {
      if (existingUrl) {
        await storageService.deleteImage(existingUrl);
      }
      return storageService.uploadImage(file, folder);
    }

    if (urlFromBody !== undefined) {
      return urlFromBody || undefined;
    }

    return existingUrl || undefined;
  },

  /**
   * Upload an array of gallery image files in parallel.
   */
  uploadGalleryImages: async (files: Express.Multer.File[], folder: string): Promise<string[]> => {
    return Promise.all(files.map((file) => storageService.uploadImage(file, folder)));
  },

  /**
   * Parse a JSON string containing gallery image URLs.
   */
  parseGalleryImages: (galleryImagesJson?: string): string[] => {
    if (!galleryImagesJson) return [];
    try {
      const parsed = JSON.parse(galleryImagesJson);
      return Array.isArray(parsed)
        ? parsed.filter((url): url is string => typeof url === 'string')
        : [];
    } catch {
      return [];
    }
  },

  /**
   * Process block image uploads in parallel and build a lookup map
   * keyed by sort_order.
   */
  processBlockImageUploads: async (
    uploads: BlockImageUpload[],
    folder = 'blocks'
  ): Promise<Record<number, { url: string; slot?: number }[]>> => {
    const results = await Promise.all(
      uploads.map(async (upload) => ({
        sort_order: upload.sort_order,
        url: await storageService.uploadImage(upload.file, folder),
        slot: upload.imageSlot,
      }))
    );

    const map: Record<number, { url: string; slot?: number }[]> = {};
    for (const result of results) {
      if (!map[result.sort_order]) {
        map[result.sort_order] = [];
      }
      map[result.sort_order].push({ url: result.url, slot: result.slot });
    }

    return map;
  },

  /**
   * Apply uploaded image URLs to block data objects.
   */
  applyBlockImageUrls: (
    blocks: UpsertBlockInput[],
    uploadMap: Record<number, { url: string; slot?: number }[]>
  ): UpsertBlockInput[] => {
    return blocks.map((block) => {
      const uploads = uploadMap[block.sort_order];
      if (!uploads) return block;

      const data = { ...(block.data as Record<string, unknown>) };
      for (const upload of uploads) {
        if (upload.slot !== undefined) {
          const images = [...((data.images as { url: string; alt: string }[]) || [])];
          images[upload.slot] = { ...images[upload.slot], url: upload.url };
          data.images = images;
        } else {
          data.image_url = upload.url;
        }
      }

      return { ...block, data: data as BlockData };
    });
  },
};
