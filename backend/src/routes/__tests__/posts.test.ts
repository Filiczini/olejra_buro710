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
  optionalAuthMiddleware: (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../../middleware/multer', () => ({
  uploadBlockMedia: (_req: any, _res: any, next: any) => next(),
  uploadGalleryImages: (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../../services/postService', () => ({
  postService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getBySlug: vi.fn(),
    getFeatured: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    generateSlug: vi.fn(() => 'generated-slug'),
  },
}));

vi.mock('../../services/storageService', () => ({
  storageService: {
    uploadImage: vi.fn(),
    deleteImage: vi.fn(),
  },
}));

vi.mock('../../services/blockService', () => ({
  blockService: {
    getByPostId: vi.fn(),
    update: vi.fn(),
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

import postsRouter from '../posts';
import { postService } from '../../services/postService';
import { storageService } from '../../services/storageService';
import { activityLogService } from '../../services/activityLogService';
import { AppError } from '../../lib/errors';

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postsRouter);
  return app;
};

const mockPost = {
  id: 'post-1',
  title: 'Test Post',
  slug: 'test-post',
  status: 'published',
  featured: false,
  seo_title: null,
  seo_description: null,
  og_image_url: null,
  hero_image_url: null,
  hero_title: null,
  hero_subtitle: null,
  hero_tags: null,
  hero_location: null,
  hero_year: null,
  gallery_images: null,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  deleted_at: null,
};

describe('Internal Posts Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('returns paginated posts', async () => {
      vi.mocked(postService.getAll).mockResolvedValue({
        data: [mockPost],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      } as any);

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(postService.getAll).toHaveBeenCalledWith({ status: 'published' });
    });

    it('passes query params', async () => {
      vi.mocked(postService.getAll).mockResolvedValue({
        data: [],
        pagination: { page: 2, limit: 5, total: 0, totalPages: 0 },
      } as any);

      await request(app).get('/api/posts?page=2&limit=5&status=published&search=hello');

      expect(postService.getAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        status: 'published',
        search: 'hello',
      });
    });

    it('returns 500 on error', async () => {
      vi.mocked(postService.getAll).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/posts/featured', () => {
    it('returns featured posts', async () => {
      vi.mocked(postService.getFeatured).mockResolvedValue([mockPost] as any);

      const response = await request(app).get('/api/posts/featured');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('returns 500 on error', async () => {
      vi.mocked(postService.getFeatured).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/posts/featured');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/posts/public/:slug', () => {
    it('returns post by slug', async () => {
      vi.mocked(postService.getBySlug).mockResolvedValue({ post: mockPost, blocks: [] } as any);

      const response = await request(app).get('/api/posts/public/test-post');

      expect(response.status).toBe(200);
      expect(response.body.post.slug).toBe('test-post');
    });

    it('returns 404 when post not found', async () => {
      vi.mocked(postService.getBySlug).mockRejectedValue(new AppError('Post not found', 404));

      const response = await request(app).get('/api/posts/public/missing');

      expect(response.status).toBe(404);
    });

    it('returns 500 on unexpected error', async () => {
      vi.mocked(postService.getBySlug).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/posts/public/test');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('returns post by id', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);

      const response = await request(app).get('/api/posts/post-1');

      expect(response.status).toBe(200);
      expect(response.body.post.id).toBe('post-1');
    });

    it('returns 404 when post not found', async () => {
      vi.mocked(postService.getById).mockRejectedValue(new AppError('Post not found', 404));

      const response = await request(app).get('/api/posts/missing');

      expect(response.status).toBe(404);
    });

    it('returns 500 on unexpected error', async () => {
      vi.mocked(postService.getById).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/posts/post-1');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/posts', () => {
    it('creates a post', async () => {
      vi.mocked(postService.create).mockResolvedValue(mockPost as any);
      vi.mocked(activityLogService.log).mockResolvedValue({} as any);

      const response = await request(app).post('/api/posts').send({
        title: 'New Post',
        slug: 'new-post',
        status: 'draft',
      });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test Post');
    });

    it('returns 400 when validation fails', async () => {
      const response = await request(app).post('/api/posts').send({ title: '' });

      expect(response.status).toBe(400);
    });

    it('returns 500 on service error', async () => {
      vi.mocked(postService.create).mockRejectedValue(new Error('DB error'));

      const response = await request(app).post('/api/posts').send({
        title: 'New Post',
        slug: 'new-post',
        status: 'draft',
      });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('updates a post', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);
      vi.mocked(postService.update).mockResolvedValue(mockPost as any);

      const response = await request(app).put('/api/posts/post-1').send({
        title: 'Updated',
        status: 'published',
      });

      expect(response.status).toBe(200);
    });

    it('returns 400 when validation fails', async () => {
      const response = await request(app).put('/api/posts/post-1').send({ title: '' });

      expect(response.status).toBe(400);
    });

    it('returns 404 when post not found', async () => {
      vi.mocked(postService.getById).mockRejectedValue(new AppError('Post not found', 404));

      const response = await request(app).put('/api/posts/missing').send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('returns 500 on service error', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);
      vi.mocked(postService.update).mockRejectedValue(new Error('DB error'));

      const response = await request(app).put('/api/posts/post-1').send({ title: 'Updated' });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('deletes a post', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);
      vi.mocked(postService.delete).mockResolvedValue(undefined);

      const response = await request(app).delete('/api/posts/post-1');

      expect(response.status).toBe(200);
      expect(postService.delete).toHaveBeenCalledWith('post-1');
    });

    it('returns 500 on error', async () => {
      vi.mocked(postService.getById).mockRejectedValue(new Error('DB error'));

      const response = await request(app).delete('/api/posts/post-1');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/posts/:id/gallery', () => {
    it('returns 400 when no files', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);

      const response = await request(app).post('/api/posts/post-1/gallery');

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/posts/:id/gallery', () => {
    it('returns 400 when image_url is missing', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);

      const response = await request(app).delete('/api/posts/post-1/gallery').send({});

      expect(response.status).toBe(400);
    });

    it('returns 400 when image_url is invalid', async () => {
      vi.mocked(postService.getById).mockResolvedValue({ post: mockPost, blocks: [] } as any);

      const response = await request(app)
        .delete('/api/posts/post-1/gallery')
        .send({ image_url: 'not-a-url' });

      expect(response.status).toBe(400);
    });

    it('removes image from gallery', async () => {
      const postWithGallery = { ...mockPost, gallery_images: ['http://example.com/img.jpg'] };
      vi.mocked(postService.getById).mockResolvedValue({
        post: postWithGallery,
        blocks: [],
      } as any);
      vi.mocked(postService.update).mockResolvedValue(postWithGallery as any);
      vi.mocked(storageService.deleteImage).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/posts/post-1/gallery')
        .send({ image_url: 'http://example.com/img.jpg' });

      expect(response.status).toBe(200);
      expect(storageService.deleteImage).toHaveBeenCalledWith('http://example.com/img.jpg');
    });
  });
});
