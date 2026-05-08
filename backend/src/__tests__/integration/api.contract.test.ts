import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import {
  paginatedPostResponseSchema,
  postWithBlocksResponseSchema,
  postResponseSchema,
  messageResponseSchema,
  errorResponseSchema,
} from '@buro710/shared';
import { setupIntegrationTests, teardownIntegrationTests } from './setup';

// Set API key before any env validation runs
process.env.API_KEY = 'test-api-key';

describe('API v1 contract tests', () => {
  let app: Express.Application;
  let apiKey: string;

  beforeAll(async () => {
    const { databaseUrl } = await setupIntegrationTests();
    process.env.DATABASE_URL = databaseUrl;

    // Reset module cache so db/index.ts and env.ts re-evaluate with real DATABASE_URL
    vi.resetModules();

    // Mock storage and telegram to avoid filesystem / network side effects
    vi.doMock('../../services/storageService', () => ({
      storageService: {
        uploadImage: vi.fn().mockResolvedValue('/uploads/test.jpg'),
        deleteImage: vi.fn().mockResolvedValue(undefined),
      },
    }));

    vi.doMock('../../services/telegramService', () => ({
      telegramService: {
        sendMessage: vi.fn().mockResolvedValue({ success: true, messageId: 't' }),
      },
    }));

    // Re-import db with real DATABASE_URL, then mock it for routes
    const dbModule = await import('../../db/index.js');
    const { db, pool, schema } = dbModule;
    vi.doMock('../../db', () => ({ db, pool, schema }));

    // Now import app — it will pick up the mocked db
    const appModule = await import('../../app.js');
    app = appModule.app;

    apiKey = process.env.API_KEY!;
  }, 120_000);

  afterAll(async () => {
    await teardownIntegrationTests();
  });

  describe('POST /api/v1/posts', () => {
    it('creates a post and returns valid schema', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('X-API-Key', apiKey)
        .send({ title: 'Contract Test Post', slug: 'contract-test-post', status: 'published' })
        .expect(201);

      const parsed = postResponseSchema.parse(res.body);
      expect(parsed.title).toBe('Contract Test Post');
      expect(parsed.slug).toBe('contract-test-post');
      expect(parsed.status).toBe('published');
    });

    it('returns validation error schema on bad input', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('X-API-Key', apiKey)
        .send({ status: 'published' })
        .expect(400);

      errorResponseSchema.parse(res.body);
    });
  });

  describe('GET /api/v1/posts', () => {
    it('returns paginated posts matching schema', async () => {
      const res = await request(app).get('/api/v1/posts').set('X-API-Key', apiKey).expect(200);

      const parsed = paginatedPostResponseSchema.parse(res.body);
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed.pagination).toHaveProperty('page');
      expect(parsed.pagination).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/v1/posts/:id', () => {
    it('returns post with blocks matching schema', async () => {
      const createRes = await request(app)
        .post('/api/v1/posts')
        .set('X-API-Key', apiKey)
        .send({ title: 'Get By ID Contract', slug: 'get-by-id-contract', status: 'draft' });

      const post = postResponseSchema.parse(createRes.body);

      const res = await request(app)
        .get(`/api/v1/posts/${post.id}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      const parsed = postWithBlocksResponseSchema.parse(res.body);
      expect(parsed.post.id).toBe(post.id);
      expect(Array.isArray(parsed.blocks)).toBe(true);
    });

    it('returns 404 error schema for missing post', async () => {
      const res = await request(app)
        .get('/api/v1/posts/00000000-0000-0000-0000-000000000000')
        .set('X-API-Key', apiKey)
        .expect(404);

      errorResponseSchema.parse(res.body);
    });
  });

  describe('PUT /api/v1/posts/:id', () => {
    it('updates a post and returns valid schema', async () => {
      const createRes = await request(app)
        .post('/api/v1/posts')
        .set('X-API-Key', apiKey)
        .send({ title: 'Update Contract', slug: 'update-contract', status: 'draft' });

      const post = postResponseSchema.parse(createRes.body);

      const res = await request(app)
        .put(`/api/v1/posts/${post.id}`)
        .set('X-API-Key', apiKey)
        .send({ title: 'Updated Contract Title' })
        .expect(200);

      const parsed = postResponseSchema.parse(res.body);
      expect(parsed.title).toBe('Updated Contract Title');
      expect(parsed.id).toBe(post.id);
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    it('deletes a post and returns message schema', async () => {
      const createRes = await request(app)
        .post('/api/v1/posts')
        .set('X-API-Key', apiKey)
        .send({ title: 'Delete Contract', slug: 'delete-contract', status: 'draft' });

      const post = postResponseSchema.parse(createRes.body);

      const res = await request(app)
        .delete(`/api/v1/posts/${post.id}`)
        .set('X-API-Key', apiKey)
        .expect(200);

      messageResponseSchema.parse(res.body);
    });
  });

  describe('Auth', () => {
    it('returns 401 without API key', async () => {
      const res = await request(app).get('/api/v1/posts').expect(401);
      errorResponseSchema.parse(res.body);
    });

    it('returns 401 with invalid API key', async () => {
      const res = await request(app)
        .get('/api/v1/posts')
        .set('X-API-Key', 'invalid-key')
        .expect(401);
      errorResponseSchema.parse(res.body);
    });
  });
});
