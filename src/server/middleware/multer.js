import multer from 'multer';
import { memoryStorage } from 'multer';
const storage = memoryStorage();
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPEG and PNG files are allowed'));
    }
};
export const uploadMiddleware = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
});
export const uploadSingleImage = uploadMiddleware.single('image');
