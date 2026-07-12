/**
 * E2E Tests: CRUD lifecycle, edge cases, and error recovery
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
import { store, resetStore, createTestApp, withApiKey } from './posts.e2e.setup';

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

describe('Happy Path: Full CRUD Cycle', () => {
  it('executes complete CRUD lifecycle: create → read → update → delete', async () => {
    // ================================================================
    // Step 1: CREATE - Create a new post
    // ================================================================
    const createData = {
      title: 'E2E Test Post - Full Cycle',
      slug: 'e2e-test-full-cycle',
      status: 'draft',
      hero_title: 'Hero Title for E2E',
      hero_location: 'Kyiv',
      hero_year: '2024',
    };

    // Act: Create post
    const createResponse = await withApiKey(request(app).post('/api/v1/posts').send(createData));

    // Assert: Post created successfully
    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      title: createData.title,
      slug: createData.slug,
      status: 'draft',
      hero_title: createData.hero_title,
    });
    expect(createResponse.body.id).toBeDefined();
    expect(createResponse.body.created_at).toBeDefined();

    const postId = createResponse.body.id;

    // ================================================================
    // Step 2: READ - Get created post
    // ================================================================
    // Act: Get the post
    const getResponse = await withApiKey(request(app).get(`/api/v1/posts/${postId}`));

    // Assert: Retrieved post matches created data
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.post).toMatchObject({
      id: postId,
      title: createData.title,
      slug: createData.slug,
      status: 'draft',
    });

    // ================================================================
    // Step 3: UPDATE - Update the post
    // ================================================================
    const updateData = {
      title: 'E2E Test Post - Updated Title',
      status: 'published',
      hero_location: 'Lviv',
    };

    // Act: Update the post
    const updateResponse = await withApiKey(
      request(app).put(`/api/v1/posts/${postId}`).send(updateData)
    );

    // Assert: Update successful
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: postId,
      title: updateData.title,
      status: 'published',
      hero_location: 'Lviv',
    });

    // ================================================================
    // Step 4: VERIFY UPDATE - Get updated post
    // ================================================================
    // Act: Get the updated post
    const verifyResponse = await withApiKey(request(app).get(`/api/v1/posts/${postId}`));

    // Assert: Changes persisted
    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.post.title).toBe(updateData.title);
    expect(verifyResponse.body.post.status).toBe('published');
    expect(verifyResponse.body.post.updated_at).not.toBe(verifyResponse.body.post.created_at);

    // ================================================================
    // Step 5: DELETE - Delete the post
    // ================================================================
    // Act: Delete the post
    const deleteResponse = await withApiKey(request(app).delete(`/api/v1/posts/${postId}`));

    // Assert: Delete successful
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ message: 'Post deleted successfully' });

    // ================================================================
    // Step 6: VERIFY DELETE - Get deleted post returns 404
    // ================================================================
    // Act: Try to get deleted post
    const notFoundResponse = await withApiKey(request(app).get(`/api/v1/posts/${postId}`));

    // Assert: Post not found
    expect(notFoundResponse.status).toBe(404);
    expect(notFoundResponse.body).toEqual({ error: 'Post not found' });
  });
});

// ==========================================================================
// Edge Cases
// ==========================================================================

describe('Edge Cases', () => {
  it('creates post with all fields populated', async () => {
    // Arrange: Complete post data
    const fullPostData = {
      title: 'Complete Post with All Fields',
      slug: 'complete-post-all-fields',
      status: 'published',
      hero_title: 'Hero Title',
      hero_subtitle: 'Hero Subtitle',
      hero_tags: JSON.stringify(['architecture', 'modern', 'ukraine']),
      hero_location: 'Kyiv, Ukraine',
      hero_year: '2024',
      seo_title: 'SEO Title for Complete Post',
      seo_description: 'SEO description for the complete post with all fields',
    };

    // Act
    const response = await withApiKey(request(app).post('/api/v1/posts').send(fullPostData));

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: fullPostData.title,
      slug: fullPostData.slug,
      status: 'published',
      hero_title: fullPostData.hero_title,
      hero_subtitle: fullPostData.hero_subtitle,
      hero_location: fullPostData.hero_location,
      hero_year: fullPostData.hero_year,
      seo_title: fullPostData.seo_title,
      seo_description: fullPostData.seo_description,
    });
  });

  it('creates post with minimal fields (only title)', async () => {
    // Arrange: Minimal data
    const minimalData = {
      title: 'Minimal Post',
    };

    // Act
    const response = await withApiKey(request(app).post('/api/v1/posts').send(minimalData));

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: minimalData.title,
      status: 'draft', // Default status
    });
    expect(response.body.slug).toBeDefined(); // Auto-generated
  });

  it('updates post with new values', async () => {
    // Arrange: Create initial post
    const initialData = {
      title: 'Original Title',
      hero_title: 'Original Hero',
      hero_location: 'Original Location',
    };

    const createResponse = await withApiKey(request(app).post('/api/v1/posts').send(initialData));
    const postId = createResponse.body.id;

    // Act: Update with all required fields
    const updateData = {
      title: 'Original Title',
      hero_title: 'Original Hero',
      hero_location: 'New Location',
    };

    const updateResponse = await withApiKey(
      request(app).put(`/api/v1/posts/${postId}`).send(updateData)
    );

    // Assert: The specified field changed
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      title: updateData.title,
      hero_title: updateData.hero_title,
      hero_location: 'New Location',
    });
  });

  it('handles pagination request for page beyond available data', async () => {
    // Arrange: Create a few posts
    for (let i = 1; i <= 3; i++) {
      await withApiKey(
        request(app)
          .post('/api/v1/posts')
          .send({ title: `Post ${i}` })
      );
    }

    // Act: Request page 100 (beyond available)
    const response = await withApiKey(request(app).get('/api/v1/posts?page=100&limit=10'));

    // Assert: Empty data but valid pagination structure
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.pagination).toMatchObject({
      page: 100,
      limit: 10,
      total: 3,
      totalPages: 1,
    });
  });

  it('filters by different statuses correctly', async () => {
    // Arrange: Create posts with different statuses
    await withApiKey(
      request(app).post('/api/v1/posts').send({
        title: 'Draft Post 1',
        status: 'draft',
      })
    );
    await withApiKey(
      request(app).post('/api/v1/posts').send({
        title: 'Published Post 1',
        status: 'published',
      })
    );
    await withApiKey(
      request(app).post('/api/v1/posts').send({
        title: 'Draft Post 2',
        status: 'draft',
      })
    );

    // Act & Assert: Filter by draft
    const draftResponse = await withApiKey(request(app).get('/api/v1/posts?status=draft'));
    expect(draftResponse.status).toBe(200);
    expect(draftResponse.body.data).toHaveLength(2);
    draftResponse.body.data.forEach((post: Post) => {
      expect(post.status).toBe('draft');
    });

    // Act & Assert: Filter by published
    const publishedResponse = await withApiKey(request(app).get('/api/v1/posts?status=published'));
    expect(publishedResponse.status).toBe(200);
    expect(publishedResponse.body.data).toHaveLength(1);
    publishedResponse.body.data.forEach((post: Post) => {
      expect(post.status).toBe('published');
    });
  });

  it('searches posts by title', async () => {
    // Arrange: Create posts with different titles
    await withApiKey(request(app).post('/api/v1/posts').send({ title: 'Architecture Project' }));
    await withApiKey(request(app).post('/api/v1/posts').send({ title: 'Interior Design' }));
    await withApiKey(request(app).post('/api/v1/posts').send({ title: 'Landscape Architecture' }));

    // Act: Search for 'architecture'
    const response = await withApiKey(request(app).get('/api/v1/posts?search=architecture'));

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    response.body.data.forEach((post: Post) => {
      expect(post.title.toLowerCase()).toContain('architecture');
    });
  });
});

// ==========================================================================
// Error Recovery
// ==========================================================================

describe('Error Recovery', () => {
  it('recovers from create failure: invalid data → retry with valid data → success', async () => {
    // ================================================================
    // Step 1: Try to create with invalid data (missing title)
    // ================================================================
    const invalidData = {
      slug: 'test-without-title',
      status: 'draft',
    };

    // Act: Create with invalid data
    const failResponse = await withApiKey(request(app).post('/api/v1/posts').send(invalidData));

    // Assert: Failure response (missing title returns error string)
    expect(failResponse.status).toBe(400);
    expect(failResponse.body).toHaveProperty('error');
    expect(failResponse.body.error).toBe('Validation failed');

    // ================================================================
    // Step 2: Retry with valid data
    // ================================================================
    const validData = {
      title: 'Recovered Post with Title',
      slug: 'recovered-post',
    };

    // Act: Create with valid data
    const successResponse = await withApiKey(request(app).post('/api/v1/posts').send(validData));

    // Assert: Success
    expect(successResponse.status).toBe(201);
    expect(successResponse.body.title).toBe(validData.title);

    // ================================================================
    // Step 3: Verify post exists
    // ================================================================
    const verifyResponse = await withApiKey(
      request(app).get(`/api/v1/posts/${successResponse.body.id}`)
    );

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.post.title).toBe(validData.title);
  });

  it('handles multiple validation errors and reports all of them', async () => {
    // Arrange: Data with multiple issues
    const invalidData = {
      title: 'a'.repeat(201), // Exceeds max length
      slug: 'b'.repeat(201), // Exceeds max length
      seo_title: 'c'.repeat(61), // Exceeds max length
    };

    // Act
    const response = await withApiKey(request(app).post('/api/v1/posts').send(invalidData));

    // Assert: Multiple errors returned
    expect(response.status).toBe(400);
    expect(response.body.details).toBeDefined();
    expect(response.body.details).toContainEqual(expect.objectContaining({ field: 'title' }));
    expect(response.body.details).toContainEqual(expect.objectContaining({ field: 'slug' }));
    expect(response.body.details).toContainEqual(expect.objectContaining({ field: 'seo_title' }));
  });

  it('handles JSON parsing errors in hero_tags', async () => {
    // Arrange: Invalid JSON
    const dataWithInvalidJson = {
      title: 'Post with Invalid JSON',
      hero_tags: 'not-a-valid-json-array',
    };

    // Act
    const response = await withApiKey(request(app).post('/api/v1/posts').send(dataWithInvalidJson));

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid hero_tags format');
  });

  it('handles update of non-existent post', async () => {
    // Arrange: Update data
    const updateData = { title: 'Updated Title' };

    // Act: Try to update non-existent post
    const response = await withApiKey(
      request(app).put('/api/v1/posts/non-existent-id').send(updateData)
    );

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Post not found' });
  });
});
