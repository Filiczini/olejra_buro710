/**
 * E2E Tests: Authentication and response format
 */

import { vi } from 'vitest';

vi.mock('../../services/postService', () => ({
  postService: {
    getAll: vi.fn(
      async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        let posts = Array.from(store.posts.values());

        if (params?.status) {
          posts = posts.filter((p) => p.status === params.status);
        }

        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          posts = posts.filter((p) => p.title.toLowerCase().includes(searchLower));
        }

        posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const total = posts.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const paginatedPosts = posts.slice(start, start + limit);

        return {
          data: paginatedPosts,
          pagination: { page, limit, total, totalPages },
        } as PaginatedResponse<Post>;
      }
    ),

    getById: vi.fn(async (id: string) => {
      const post = store.posts.get(id);
      if (!post) {
        throw Object.assign(new Error('Post not found'), { statusCode: 404 });
      }
      return { post, blocks: [] };
    }),

    create: vi.fn(async (data: Partial<Post> & { title: string }) => {
      const id = `post-${store.idCounter++}`;
      const now = new Date().toISOString();
      const slug =
        data.slug ||
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      let uniqueSlug = slug;
      let counter = 1;
      while (Array.from(store.posts.values()).some((p) => p.slug === uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const post: Post = {
        id,
        title: data.title,
        slug: uniqueSlug,
        status: data.status || 'draft',
        hero_image_url: data.hero_image_url,
        og_image_url: data.og_image_url,
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle,
        hero_tags: data.hero_tags || [],
        hero_location: data.hero_location,
        hero_year: data.hero_year,
        gallery_images: data.gallery_images || [],
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        created_at: now,
        updated_at: now,
      };

      store.posts.set(id, post);
      return post;
    }),

    update: vi.fn(async (id: string, data: Partial<Post>) => {
      const existing = store.posts.get(id);
      if (!existing) {
        throw Object.assign(new Error('Post not found'), { statusCode: 404 });
      }

      if (data.slug && data.slug !== existing.slug) {
        const duplicate = Array.from(store.posts.values()).find(
          (p) => p.slug === data.slug && p.id !== id
        );
        if (duplicate) {
          throw Object.assign(new Error('Slug already exists'), { statusCode: 409 });
        }
      }

      const updated: Post = {
        ...existing,
        ...data,
        id: existing.id,
        created_at: existing.created_at,
        updated_at: new Date().toISOString(),
      };

      store.posts.set(id, updated);
      return updated;
    }),

    delete: vi.fn(async (id: string) => {
      if (!store.posts.has(id)) {
        throw Object.assign(new Error('Post not found'), { statusCode: 404 });
      }
      store.posts.delete(id);
    }),

    generateSlug: vi.fn((title: string) =>
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    ),
  },
}));

vi.mock('../../services/storageService', () => ({
  storageService: {
    uploadImage: vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg'),
    deleteImage: vi.fn().mockResolvedValue(undefined),
    deleteImages: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../services/activityLogService', () => ({
  activityLogService: {
    log: vi.fn().mockResolvedValue({}),
  },
}));

import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import type { Post, PaginatedResponse } from '@buro710/shared';
import { store, resetStore, createTestApp, withApiKey, INVALID_API_KEY } from './posts.e2e.setup';

let app: Application;

beforeAll(() => {
  app = createTestApp();
});

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Authentication', () => {
  it('rejects request without API key', async () => {
    // Act
    const response = await request(app).get('/api/v1/posts');

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'API key is required' });
  });

  it('rejects request with invalid API key', async () => {
    // Act
    const response = await withApiKey(request(app).get('/api/v1/posts'), INVALID_API_KEY);

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid API key' });
  });

  it('accepts valid API key', async () => {
    // Act
    const response = await withApiKey(request(app).get('/api/v1/posts'));

    // Assert
    expect(response.status).toBe(200);
  });
});

// ==========================================================================
// Response Format Validation
// ==========================================================================

describe('Response Format', () => {
  it('returns consistent pagination structure', async () => {
    // Arrange: Create some posts
    for (let i = 1; i <= 5; i++) {
      await withApiKey(
        request(app)
          .post('/api/v1/posts')
          .send({ title: `Format Test ${i}` })
      );
    }

    // Act
    const response = await withApiKey(request(app).get('/api/v1/posts'));

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('totalPages');
  });

  it('returns post with all expected fields', async () => {
    // Arrange: Create post
    const createResponse = await withApiKey(
      request(app).post('/api/v1/posts').send({ title: 'Field Test Post' })
    );
    const postId = createResponse.body.id;

    // Act
    const response = await withApiKey(request(app).get(`/api/v1/posts/${postId}`));

    // Assert: Check required fields
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('post');
    expect(response.body).toHaveProperty('blocks');

    const post = response.body.post;
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('slug');
    expect(post).toHaveProperty('status');
    expect(post).toHaveProperty('created_at');
    expect(post).toHaveProperty('updated_at');
  });

  it('returns error in consistent format', async () => {
    // Act: Try to create without title
    const response = await withApiKey(request(app).post('/api/v1/posts').send({}));

    // Assert (API returns error string for missing title)
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Title is required');
  });
});
