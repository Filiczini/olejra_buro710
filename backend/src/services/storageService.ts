import { supabase } from '../config/supabase';

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
   * Upload a single image to Supabase storage
   * @param file - Express.Multer.File object
   * @returns Public URL of uploaded image
   */
  uploadImage: async (file: Express.Multer.File, bucket?: string): Promise<string> => {
    const targetBucket = bucket || 'projects';
    const fileName = storageService.generateSafeFileName(file.originalname);
    const folder = bucket === 'blocks' ? 'blocks' : 'projects/media';
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(targetBucket).getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Upload multiple images to Supabase storage
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
   * Delete a single image from Supabase storage
   * @param imageUrl - Public URL of image to delete
   * @returns Object with success status and optional error
   */
  deleteImage: async (imageUrl: string): Promise<DeleteResult> => {
    try {
      let bucket = 'projects';
      let filePath: string | null = null;

      if (imageUrl.includes('/blocks/')) {
        bucket = 'blocks';
        filePath = imageUrl.split('/blocks/')[1];
      } else if (imageUrl.includes('/projects/')) {
        filePath = imageUrl.split('/projects/')[1];
      }

      if (!filePath) {
        return { success: false, error: 'Invalid image URL format' };
      }

      const { error: deleteError } = await supabase.storage.from(bucket).remove([filePath]);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Delete multiple images from Supabase storage
   * @param imageUrls - Array of public URLs to delete
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
