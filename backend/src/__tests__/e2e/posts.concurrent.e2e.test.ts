/**
 * E2E Tests: Concurrent requests, large body, and security
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

describe('Concurrent Requests', () => {
  it('handles multiple concurrent GET requests', async () => {
    // Arrange: Create some posts
    for (let i = 1; i <= 5; i++) {
      await withApiKey(
        request(app)
          .post('/api/v1/posts')
          .send({ title: `Concurrent Test ${i}` })
      );
    }

    // Act: Make concurrent requests
    const requests = Array(10)
      .fill(null)
      .map(() => withApiKey(request(app).get('/api/v1/posts')));

    const responses = await Promise.all(requests);

    // Assert: All succeed with same data
    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
    });
  });

  it('handles concurrent CREATE requests with unique slugs', async () => {
    // Arrange: Base post data
    const createPost = (index: number) =>
      withApiKey(
        request(app)
          .post('/api/v1/posts')
          .send({
            title: `Concurrent Post ${index}`,
            slug: `concurrent-post-${index}`,
          })
      );

    // Act: Create multiple posts concurrently
    const requests = Array(5)
      .fill(null)
      .map((_, index) => createPost(index));

    const responses = await Promise.all(requests);

    // Assert: All posts created successfully
    responses.forEach((response, index) => {
      expect(response.status).toBe(201);
      expect(response.body.slug).toBe(`concurrent-post-${index}`);
    });

    // Verify all posts exist
    const listResponse = await withApiKey(request(app).get('/api/v1/posts'));
    expect(listResponse.body.data).toHaveLength(5);
  });

  it('handles concurrent READ and UPDATE on different posts', async () => {
    // Arrange: Create multiple posts
    const postIds: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const response = await withApiKey(
        request(app)
          .post('/api/v1/posts')
          .send({ title: `RW Test ${i}` })
      );
      postIds.push(response.body.id);
    }

    // Act: Mix of reads and updates
    const requests = [
      withApiKey(request(app).get(`/api/v1/posts/${postIds[0]}`)),
      withApiKey(request(app).put(`/api/v1/posts/${postIds[1]}`).send({ title: 'Updated' })),
      withApiKey(request(app).get(`/api/v1/posts/${postIds[2]}`)),
      withApiKey(request(app).get('/api/v1/posts')),
    ];

    const responses = await Promise.all(requests);

    // Assert: All operations succeed
    expect(responses[0].status).toBe(200); // GET
    expect(responses[1].status).toBe(200); // PUT
    expect(responses[2].status).toBe(200); // GET
    expect(responses[3].status).toBe(200); // GET list
  });
});

// ==========================================================================
// Large Request Body
// ==========================================================================

describe('Large Request Body', () => {
  it('handles large SEO description at boundary', async () => {
    // Arrange: Exactly at max length (160)
    const maxSeoDesc = 'a'.repeat(160);

    // Act
    const response = await withApiKey(
      request(app).post('/api/v1/posts').send({
        title: 'Post with Max SEO Desc',
        seo_description: maxSeoDesc,
      })
    );

    // Assert
    expect(response.status).toBe(201);
  });

  it('rejects SEO description exceeding max length', async () => {
    // Arrange: Over max length
    const overMaxSeoDesc = 'a'.repeat(161);

    // Act
    const response = await withApiKey(
      request(app).post('/api/v1/posts').send({
        title: 'Post with Over Max SEO Desc',
        seo_description: overMaxSeoDesc,
      })
    );

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.details).toContainEqual(
      expect.objectContaining({
        field: 'seo_description',
        message: expect.stringContaining('160'),
      })
    );
  });

  it('handles large hero_tags array', async () => {
    // Arrange: Many tags (within the 15-tag limit)
    const manyTags = Array(15)
      .fill(null)
      .map((_, i) => `tag-${i}`);

    // Act
    const response = await withApiKey(
      request(app)
        .post('/api/v1/posts')
        .send({
          title: 'Post with Many Tags',
          hero_tags: JSON.stringify(manyTags),
        })
    );

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.hero_tags).toHaveLength(15);
  });
});

// ==========================================================================
// Security Tests
// ==========================================================================

describe('Security Tests', () => {
  it('handles SQL injection attempts in title safely', async () => {
    // Arrange: Malicious SQL injection payload
    const sqlInjectionPayloads = [
      "'; DROP TABLE posts; --",
      "1' OR '1'='1",
      "admin'--",
      '1; DELETE FROM posts WHERE 1=1; --',
      "' UNION SELECT * FROM posts --",
    ];

    // Act & Assert: Each payload should be handled safely
    for (const payload of sqlInjectionPayloads) {
      const response = await withApiKey(
        request(app).post('/api/v1/posts').send({
          title: payload,
        })
      );

      // The title should be stored as-is (escaped by parameterized queries)
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(payload);

      // Verify the post exists and can be retrieved
      const getResponse = await withApiKey(request(app).get(`/api/v1/posts/${response.body.id}`));
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.post.title).toBe(payload);
    }
  });

  it('handles SQL injection attempts in search parameter', async () => {
    // Arrange: Create a test post
    await withApiKey(request(app).post('/api/v1/posts').send({ title: 'Normal Post' }));

    const sqlInjectionSearches = [
      "'; DROP TABLE posts; --",
      "' OR '1'='1",
      '1; DELETE FROM posts; --',
    ];

    // Act & Assert: Each search should return safely (empty or filtered results)
    for (const search of sqlInjectionSearches) {
      const response = await withApiKey(
        request(app).get(`/api/v1/posts?search=${encodeURIComponent(search)}`)
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      // Should not crash or return unexpected data
    }
  });

  it('stores XSS payloads safely without execution (content is escaped)', async () => {
    // Arrange: Various XSS payloads
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<body onload="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
    ];

    // Act & Assert: Each payload should be stored as-is
    for (const payload of xssPayloads) {
      const response = await withApiKey(
        request(app)
          .post('/api/v1/posts')
          .send({
            title: `XSS Test: ${payload}`,
            hero_title: payload,
            hero_subtitle: payload,
          })
      );

      // The API should accept the data (sanitization is frontend responsibility)
      expect(response.status).toBe(201);
      expect(response.body.hero_title).toBe(payload);
      expect(response.body.hero_subtitle).toBe(payload);

      // Verify stored data can be retrieved unchanged
      const getResponse = await withApiKey(request(app).get(`/api/v1/posts/${response.body.id}`));
      expect(getResponse.body.post.hero_title).toBe(payload);
    }
  });

  it('handles XSS in hero_tags array', async () => {
    // Arrange: XSS payloads in tags (within 20-char tag limit)
    const xssTags = ['<script>xss</script>', '<img src=x>'];

    // Act
    const response = await withApiKey(
      request(app)
        .post('/api/v1/posts')
        .send({
          title: 'Post with XSS Tags',
          hero_tags: JSON.stringify(xssTags),
        })
    );

    // Assert: Tags stored as-is (frontend responsibility to escape)
    expect(response.status).toBe(201);
    expect(response.body.hero_tags).toEqual(xssTags);
  });

  it('handles extremely large payload gracefully', async () => {
    // Arrange: Very large string (1MB)
    const largeString = 'x'.repeat(1024 * 1024);

    // Act
    const response = await withApiKey(
      request(app).post('/api/v1/posts').send({
        title: 'Large Payload Test',
        seo_description: largeString,
      })
    );

    // Assert: Should either reject or handle appropriately
    // The validation should catch oversized fields
    expect([400, 413, 500]).toContain(response.status);
  });

  it('handles deeply nested JSON in blocks', async () => {
    // Arrange: Deeply nested object
    const createNestedObject = (depth: number): Record<string, unknown> => {
      if (depth === 0) return { value: 'test' };
      return { nested: createNestedObject(depth - 1) };
    };

    const deeplyNested = createNestedObject(50);

    // Act
    const response = await withApiKey(
      request(app)
        .post('/api/v1/posts')
        .send({
          title: 'Nested JSON Test',
          blocks: JSON.stringify([
            {
              type: 'text_full',
              data: deeplyNested,
              sort_order: 0,
            },
          ]),
        })
    );

    // Assert: Should handle without stack overflow
    expect([201, 400, 500]).toContain(response.status);
  });

  it('handles null bytes in input', async () => {
    // Arrange: String with null bytes
    const nullByteTitle = 'Test\x00Post\x00With\x00Nulls';

    // Act
    const response = await withApiKey(
      request(app).post('/api/v1/posts').send({
        title: nullByteTitle,
      })
    );

    // Assert: Should handle gracefully
    expect([201, 400]).toContain(response.status);
    if (response.status === 201) {
      // If accepted, null bytes should be handled safely
      expect(response.body.id).toBeDefined();
    }
  });

  it('handles unicode and special characters safely', async () => {
    // Arrange: Various unicode and special chars
    const specialTitles = [
      '𝕋𝕖𝕤𝕥 ℂℝℰ𝔸𝕋𝕀𝕍𝔼', // Mathematical alphanumeric symbols
      '测试中文标题', // Chinese
      'тест кирилиця', // Cyrillic (Ukrainian)
      '🚀🎉💻🔐', // Emojis
      '​‌‍', // Zero-width characters
      'Test Null', // Null character
    ];

    // Act & Assert
    for (const title of specialTitles) {
      const response = await withApiKey(request(app).post('/api/v1/posts').send({ title }));

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(title);
    }
  });

  it('handles HTML entities in title', async () => {
    // Arrange
    const htmlEntitiesTitle = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';

    // Act
    const response = await withApiKey(
      request(app).post('/api/v1/posts').send({
        title: htmlEntitiesTitle,
      })
    );

    // Assert: Stored as-is (already encoded)
    expect(response.status).toBe(201);
    expect(response.body.title).toBe(htmlEntitiesTitle);
  });
});
