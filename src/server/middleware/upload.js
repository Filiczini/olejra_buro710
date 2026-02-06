import multer from 'multer';
import path from 'path';
import { UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../config/upload';
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `project-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
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
