import path from 'path';
import fs from 'fs/promises';
import { validateFileSignature } from '../middleware/multer';
import { logger } from '../lib/logger';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface BulkUploadResult {
  success: boolean;
  urls: string[];
  errors: string[];
}

interface DeleteResult {
  success: boolean;
  error?: string;
}

interface BulkDeleteResult {
  success: boolean;
  failed: string[];
}

const uploadsDir = process.env.UPLOADS_DIR || '/app/uploads';

export const storageService = {
  /**
   * Generate a safe filename with latin characters only
   */
  generateSafeFileName: (originalName: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${ext}`;
  },

  /**
   * Upload a single image to local storage
   * @param file - Express.Multer.File object
   * @param bucket - Subfolder name (e.g. 'posts', 'blocks')
   * @returns Public URL path of uploaded image
   */
  uploadImage: async (file: Express.Multer.File, bucket?: string): Promise<string> => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(
        `File extension '${ext}' is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
      );
    }

    // Validate file signature (magic bytes) to prevent MIME spoofing
    if (!validateFileSignature(file.buffer, file.mimetype)) {
      throw new Error('File content does not match its declared type');
    }

    const folder = bucket || 'posts';
    const fileName = storageService.generateSafeFileName(file.originalname);
    const dirPath = path.join(uploadsDir, folder);
    const filePath = path.join(dirPath, fileName);

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, file.buffer);

    logger.info(`Image uploaded: ${filePath}`);

    return `/uploads/${folder}/${fileName}`;
  },

  /**
   * Upload multiple images to local storage
   * @param files - Array of Express.Multer.File objects
   * @returns Object with success status, array of URLs, and array of errors
   */
  uploadImages: async (files: Express.Multer.File[]): Promise<BulkUploadResult> => {
    const uploadPromises = files.map(async (file): Promise<UploadResult> => {
      try {
        const url = await storageService.uploadImage(file);
        return { success: true, url };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
        return { success: false, error: errorMessage };
      }
    });

    const results = await Promise.all(uploadPromises);

    const urls = results
      .filter(
        (result): result is UploadResult & { url: string } =>
          result.success && result.url !== undefined
      )
      .map((result) => result.url);

    const errors = results
      .filter(
        (result): result is UploadResult & { error: string } =>
          !result.success && result.error !== undefined
      )
      .map((result) => result.error);

    return {
      success: urls.length > 0,
      urls,
      errors,
    };
  },

  /**
   * Delete a single image from local storage
   * @param imageUrl - URL path of image to delete (e.g. /uploads/posts/123-abc.jpg)
   * @returns Object with success status and optional error
   */
  deleteImage: async (imageUrl: string): Promise<DeleteResult> => {
    try {
      let filePath: string | null = null;

      if (imageUrl.startsWith('/uploads/')) {
        // Local path: /uploads/posts/file.jpg
        filePath = path.join(uploadsDir, imageUrl.replace('/uploads/', ''));
      } else if (imageUrl.includes('/uploads/')) {
        // Full URL with /uploads/ in it
        filePath = path.join(uploadsDir, imageUrl.split('/uploads/')[1]);
      }

      if (!filePath) {
        return { success: false, error: 'Invalid image URL format' };
      }

      // Prevent path traversal attacks
      const resolvedPath = path.resolve(filePath);
      const resolvedUploads = path.resolve(uploadsDir);
      if (!resolvedPath.startsWith(resolvedUploads)) {
        return { success: false, error: 'Invalid file path' };
      }

      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File already gone — treat as success
        return { success: true };
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Delete multiple images from local storage
   * @param imageUrls - Array of URL paths to delete
   * @returns Object with success status and array of failed URLs
   */
  deleteImages: async (imageUrls: string[]): Promise<BulkDeleteResult> => {
    const deletePromises = imageUrls.map(
      async (url): Promise<{ url: string; success: boolean }> => {
        const result = await storageService.deleteImage(url);
        return { url, success: result.success };
      }
    );

    const results = await Promise.all(deletePromises);

    const failed = results.filter((result) => !result.success).map((result) => result.url);

    return {
      success: failed.length === 0,
      failed,
    };
  },
};
