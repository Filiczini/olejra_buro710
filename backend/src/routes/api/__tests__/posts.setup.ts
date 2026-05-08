import express from 'express';
import request from 'supertest';
import type { Application } from 'express';
import postsRouter from '../posts';
import { AppError } from '../../../lib/errors';

export const TEST_API_KEY = 'test-api-key-12345';
export const INVALID_API_KEY = 'invalid-key';

export const MOCK_POST = {
  id: 'post-123',
  title: 'Test Post',
  slug: 'test-post',
  status: 'draft' as const,
  hero_image_url: 'https://example.com/hero.jpg',
  hero_title: 'Hero Title',
  hero_subtitle: 'Hero Subtitle',
  hero_tags: ['tag1', 'tag2'],
  hero_location: 'Kyiv',
  hero_year: '2024',
  gallery_images: ['https://example.com/img1.jpg'],
  seo_title: 'SEO Title',
  seo_description: 'SEO Description',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const MOCK_BLOCK = {
  id: 'block-123',
  post_id: 'post-123',
  type: 'text_full' as const,
  data: { content: 'Test content' },
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
};

export const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/posts', postsRouter);
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

export const withApiKey = (req: request.Test, key: string = TEST_API_KEY) =>
  req.set('X-API-Key', key);
