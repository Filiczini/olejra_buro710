import multer from 'multer';
import { memoryStorage } from 'multer';
import type { FileFilterCallback } from 'multer';

const storage = memoryStorage();
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const fileFilter = (_req: any, file: any, cb: FileFilterCallback) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export const uploadSingleImage = uploadMiddleware.single('image');

/**
 * Middleware to handle multiple file uploads with different field names.
 * Accepts 'heroMedia' (max 1 file) and 'galleryMedia' (max 10 files) fields.
 * Files are stored in memory as Buffers.
 */
export const uploadProjectMedia = uploadMiddleware.fields([
  { name: 'heroMedia', maxCount: 5 },
  { name: 'galleryMedia', maxCount: 10 },
]);
