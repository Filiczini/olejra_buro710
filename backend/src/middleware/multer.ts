import multer from 'multer';
import { memoryStorage } from 'multer';
import type { FileFilterCallback } from 'multer';

const storage = memoryStorage();
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FIELD_SIZE = 1 * 1024 * 1024;
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/jpg'];

// Magic bytes for allowed image types
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/jpg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
};

export function validateFileSignature(buffer: Buffer, mimetype: string): boolean {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) return false;

  return signatures.some((sig) => sig.every((byte, i) => buffer.length > i && buffer[i] === byte));
}

const fileFilter = (_req: unknown, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, fieldSize: MAX_FIELD_SIZE, files: 25 },
  fileFilter,
});

export const uploadSingleImage = uploadMiddleware.single('image');

/**
 * Middleware to handle multiple file uploads with different field names.
 * Accepts 'heroMedia' (max 1 file) and 'galleryMedia' (max 10 files) fields.
 * Files are stored in memory as Buffers.
 */
export const uploadBlockMedia = uploadMiddleware.fields([
  { name: 'heroImage', maxCount: 1 },
  { name: 'ogImage', maxCount: 1 },
  { name: 'blockImages', maxCount: 20 },
  { name: 'galleryImages', maxCount: 20 },
]);

export const uploadGalleryImages = uploadMiddleware.array('galleryImages', 20);
