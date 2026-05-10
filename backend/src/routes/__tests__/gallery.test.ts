import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Application } from 'express';

vi.mock('../../middleware/auth', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { userId: 'admin-123', email: 'admin@test.com', role: 'admin' };
    next();
  },
  adminMiddleware: (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../../middleware/multer', () => ({
  uploadGalleryImages: (_req: any, _res: any, next: any) => {
    if (_req.headers['x-simulate-files']) {
      _req.files = [
        {
          fieldname: 'gallery',
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test'),
          size: 1024,
        },
      ];
    }
    next();
  },
}));

vi.mock('../../services/postService', () => ({
  postService: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../services/storageService', () => ({
  storageService: {
    uploadImage: vi.fn().mockResolvedValue('/uploads/blocks/test.jpg'),
    deleteImage: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('../../services/activityLogService', () => ({
  activityLogService: {
    log: vi.fn(),
  },
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import galleryRouter from '../gallery';
import { postService } from '../../services/postService';
import { storageService } from '../../services/storageService';
import { AppError } from '../../lib/errors';

const mockPost = {
  id: 'post-1',
  title: 'Test Post',
  slug: 'test-post',
  status: 'published',
  featured: false,
  gallery_images: null,
};

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/posts', galleryRouter);
  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  );
  return app;
};

describe('Gallery Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('POST /api/posts/:id/gallery', () => {
    it('returns 400 when no files', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);

      const response = await request(app).post('/api/posts/post-1/gallery');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No files uploaded');
    });

    it('uploads gallery images', async () => {
      vi.mocked(postService.getById).mockResolvedValue({
        post: { ...mockPost, gallery_images: ['http://example.com/existing.jpg'] },
        blocks: [],
      } as any);
      vi.mocked(postService.update).mockResolvedValue({ ...mockPost } as any);

      const response = await request(app)
        .post('/api/posts/post-1/gallery')
        .set('x-simulate-files', 'true');

      expect(response.status).toBe(200);
      expect(storageService.uploadImage).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/posts/:id/gallery', () => {
    it('returns 400 when image_url is missing', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);

      const response = await request(app).delete('/api/posts/post-1/gallery').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Image URL is required');
    });

    it('returns 400 when image_url is invalid', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);

      const response = await request(app)
        .delete('/api/posts/post-1/gallery')
        .send({ image_url: 'not-a-url' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid image URL format');
    });

    it('removes image from gallery', async () => {
      const postWithGallery = { ...mockPost, gallery_images: ['http://example.com/img.jpg'] };
      vi.mocked(postService.getById).mockResolvedValue({
        post: postWithGallery,
        blocks: [],
      } as any);
      vi.mocked(postService.update).mockResolvedValue(postWithGallery as any);
      vi.mocked(storageService.deleteImage).mockResolvedValue({ success: true } as any);

      const response = await request(app)
        .delete('/api/posts/post-1/gallery')
        .send({ image_url: 'http://example.com/img.jpg' });

      expect(response.status).toBe(200);
      expect(storageService.deleteImage).toHaveBeenCalledWith('http://example.com/img.jpg');
    });
  });
});
