export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export type ImageValidationError = 'type' | 'size';

/** Single source of truth for what counts as an uploadable image — mirrors the backend's multer config. */
export function validateImageFile(file: File): ImageValidationError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'type';
  if (file.size > MAX_IMAGE_SIZE_BYTES) return 'size';
  return null;
}
