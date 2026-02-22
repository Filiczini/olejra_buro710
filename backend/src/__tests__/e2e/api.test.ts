/**
 * E2E API Tests for Posts API
 *
 * Full end-to-end scenarios testing CRUD lifecycle, error recovery,
 * file uploads, and concurrent request handling.
 *
 * @module e2e/api.test
 */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Application } from 'express';
import type { Post, PaginatedResponse } from '../../types/post';

// ============================================================================
// Mock Configuration
// ============================================================================

// In-memory store for E2E test simulation
interface PostStore {
  posts: Map<string, Post>;
  idCounter: number;
}

const store: PostStore = {
  posts: new Map(),
  idCounter: 1,
};

// Reset store before each test suite
const resetStore = () => {
  store.posts.clear();
  store.idCounter = 1;
};

// Mock the postService with realistic behavior
vi.mock('../../services/postService', () => ({
  postService: {
    getAll: vi.fn(
      async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        let posts = Array.from(store.posts.values());

        // Filter by status
        if (params?.status) {
          posts = posts.filter((p) => p.status === params.status);
        }

        // Filter by search
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          posts = posts.filter((p) => p.title.toLowerCase().includes(searchLower));
        }

        // Sort by created_at descending
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
        throw new Error('Post not found');
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

      // Check for duplicate slug
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
        throw new Error('Post not found');
      }

      // Check for duplicate slug if provided
      if (data.slug && data.slug !== existing.slug) {
        const duplicate = Array.from(store.posts.values()).find(
          (p) => p.slug === data.slug && p.id !== id
        );
        if (duplicate) {
          throw new Error('Slug already exists');
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
        throw new Error('Post not found');
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

// Import after mocking
import postsRouter from '../../routes/api/posts';

// ============================================================================
// Test Constants
// ============================================================================

const TEST_API_KEY = 'test-api-key-e2e-testing';
const INVALID_API_KEY = 'invalid-key-e2e';

// ============================================================================
// Test App Factory
// ============================================================================

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/posts', postsRouter);
  // Error handler
  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({ error: err.message });
    }
  );
  return app;
};

// ============================================================================
// Helper Functions
// ============================================================================

const withApiKey = (req: request.Test, key: string = TEST_API_KEY) => req.set('X-API-Key', key);

// ============================================================================
// Tests
// ============================================================================

describe('E2E: Posts API', () => {
  let app: Application;
  let originalApiKey: string | undefined;

  beforeAll(() => {
    app = createTestApp();
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = TEST_API_KEY;
  });

  afterAll(() => {
    process.env.API_KEY = originalApiKey;
  });

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Happy Path: Full CRUD Cycle
  // ==========================================================================

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
      const publishedResponse = await withApiKey(
        request(app).get('/api/v1/posts?status=published')
      );
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
      await withApiKey(
        request(app).post('/api/v1/posts').send({ title: 'Landscape Architecture' })
      );

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

      // Assert: Failure response (validation returns errors array)
      expect(failResponse.status).toBe(400);
      expect(failResponse.body).toHaveProperty('errors');
      expect(Array.isArray(failResponse.body.errors)).toBe(true);
      expect(failResponse.body.errors.length).toBeGreaterThan(0);

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
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toContainEqual(expect.objectContaining({ field: 'title' }));
      expect(response.body.errors).toContainEqual(expect.objectContaining({ field: 'slug' }));
      expect(response.body.errors).toContainEqual(expect.objectContaining({ field: 'seo_title' }));
    });

    it('handles JSON parsing errors in hero_tags', async () => {
      // Arrange: Invalid JSON
      const dataWithInvalidJson = {
        title: 'Post with Invalid JSON',
        hero_tags: 'not-a-valid-json-array',
      };

      // Act
      const response = await withApiKey(
        request(app).post('/api/v1/posts').send(dataWithInvalidJson)
      );

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

  // ==========================================================================
  // Concurrent Requests
  // ==========================================================================

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
  // File Upload Simulation
  // ==========================================================================

  describe('File Upload Simulation', () => {
    it('creates post with hero_image upload', async () => {
      // Arrange: Post data with file (simulated)
      const postData = {
        title: 'Post with Hero Image',
        hero_title: 'Hero with Image',
      };

      // Act: Create post (file upload is handled by mocked storageService)
      const response = await withApiKey(
        request(app)
          .post('/api/v1/posts')
          .attach('hero_image', Buffer.from('fake-image-data'), 'hero.jpg')
          .field('title', postData.title)
          .field('hero_title', postData.hero_title)
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.hero_image_url).toBe('https://example.com/uploaded-image.jpg');
    });

    it('creates post with gallery_images upload', async () => {
      // Arrange
      const title = 'Post with Gallery';

      // Act: Create post with multiple gallery images
      const response = await withApiKey(
        request(app)
          .post('/api/v1/posts')
          .attach('gallery_images', Buffer.from('img1'), 'img1.jpg')
          .attach('gallery_images', Buffer.from('img2'), 'img2.jpg')
          .field('title', title)
          .field('gallery_images', JSON.stringify([]))
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.gallery_images).toBeDefined();
    });

    it('updates post with new hero_image', async () => {
      // Arrange: Create initial post
      const createResponse = await withApiKey(
        request(app).post('/api/v1/posts').send({ title: 'Post to Update Image' })
      );
      const postId = createResponse.body.id;

      // Act: Update with new image
      const updateResponse = await withApiKey(
        request(app)
          .put(`/api/v1/posts/${postId}`)
          .attach('hero_image', Buffer.from('new-hero'), 'new-hero.jpg')
          .field('title', 'Updated Title')
      );

      // Assert
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.hero_image_url).toBe('https://example.com/uploaded-image.jpg');
    });

    it('rejects invalid file types', async () => {
      // Act: Try to upload unsupported file type
      const response = await withApiKey(
        request(app)
          .post('/api/v1/posts')
          .attach('hero_image', Buffer.from('not-an-image'), 'document.pdf')
          .field('title', 'Post with Invalid File')
      );

      // Assert: File type rejected
      expect(response.status).toBe(500); // Multer error
    });
  });

  // ==========================================================================
  // Authentication
  // ==========================================================================

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
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'seo_description',
          message: expect.stringContaining('160 characters'),
        })
      );
    });

    it('handles large hero_tags array', async () => {
      // Arrange: Many tags
      const manyTags = Array(50)
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
      expect(response.body.hero_tags).toHaveLength(50);
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
      // Arrange: XSS payloads in tags
      const xssTags = [
        '<script>alert("tag-xss")</script>',
        '<img src=x onerror="alert(\'tag-xss\')">',
      ];

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
        '\u200B\u200C\u200D', // Zero-width characters
        'Test\u0000Null', // Null character
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

      // Assert (API returns errors array for validation failures)
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  // ==========================================================================
  // URL Image Support
  // ==========================================================================

  describe('URL Image Support', () => {
    // ==========================================================================
    // Happy Path: URL-only CRUD Cycle
    // ==========================================================================

    describe('Happy Path: URL-only CRUD Cycle', () => {
      it('executes complete CRUD lifecycle with hero_image_url only', async () => {
        // ================================================================
        // Step 1: CREATE - Create post with hero_image_url
        // ================================================================
        const createData = {
          title: 'Post with Hero Image URL',
          hero_image_url: 'https://example.com/images/hero-original.jpg',
        };

        // Act: Create post
        const createResponse = await withApiKey(
          request(app).post('/api/v1/posts').send(createData)
        );

        // Assert: Post created with URL
        expect(createResponse.status).toBe(201);
        expect(createResponse.body.hero_image_url).toBe(createData.hero_image_url);
        const postId = createResponse.body.id;

        // ================================================================
        // Step 2: READ - Verify hero_image_url persisted
        // ================================================================
        const getResponse = await withApiKey(request(app).get(`/api/v1/posts/${postId}`));

        // Assert: URL matches
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.post.hero_image_url).toBe(createData.hero_image_url);

        // ================================================================
        // Step 3: UPDATE - Update with new hero_image_url
        // ================================================================
        const updateData = {
          title: 'Updated Post with New Hero URL',
          hero_image_url: 'https://example.com/images/hero-updated.jpg',
        };

        const updateResponse = await withApiKey(
          request(app).put(`/api/v1/posts/${postId}`).send(updateData)
        );

        // Assert: Update successful with new URL
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.hero_image_url).toBe(updateData.hero_image_url);

        // ================================================================
        // Step 4: VERIFY UPDATE - Get updated post
        // ================================================================
        const verifyResponse = await withApiKey(request(app).get(`/api/v1/posts/${postId}`));

        // Assert: New URL persisted
        expect(verifyResponse.status).toBe(200);
        expect(verifyResponse.body.post.hero_image_url).toBe(updateData.hero_image_url);

        // ================================================================
        // Step 5: DELETE - Clean up
        // ================================================================
        const deleteResponse = await withApiKey(request(app).delete(`/api/v1/posts/${postId}`));

        // Assert: Delete successful
        expect(deleteResponse.status).toBe(200);
      });

      it('executes complete CRUD lifecycle with og_image_url only', async () => {
        // ================================================================
        // Step 1: CREATE - Create post with og_image_url
        // ================================================================
        const createData = {
          title: 'Post with OG Image URL',
          og_image_url: 'https://example.com/images/og-original.jpg',
        };

        const createResponse = await withApiKey(
          request(app).post('/api/v1/posts').send(createData)
        );

        // Assert: Post created with URL
        expect(createResponse.status).toBe(201);
        expect(createResponse.body.og_image_url).toBe(createData.og_image_url);
        const postId = createResponse.body.id;

        // ================================================================
        // Step 2: READ - Verify og_image_url persisted
        // ================================================================
        const getResponse = await withApiKey(request(app).get(`/api/v1/posts/${postId}`));

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.post.og_image_url).toBe(createData.og_image_url);

        // ================================================================
        // Step 3: UPDATE - Update with new og_image_url
        // ================================================================
        const updateData = {
          og_image_url: 'https://example.com/images/og-updated.jpg',
        };

        const updateResponse = await withApiKey(
          request(app).put(`/api/v1/posts/${postId}`).send(updateData)
        );

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.og_image_url).toBe(updateData.og_image_url);

        // ================================================================
        // Step 4: DELETE
        // ================================================================
        const deleteResponse = await withApiKey(request(app).delete(`/api/v1/posts/${postId}`));
        expect(deleteResponse.status).toBe(200);
      });
    });

    // ==========================================================================
    // Happy Path: Mixed URLs (hero, og, gallery)
    // ==========================================================================

    describe('Happy Path: Mixed URLs', () => {
      it('creates post with hero, og, and gallery URLs', async () => {
        // Arrange: Complete image URL data
        const createData = {
          title: 'Post with All Image URLs',
          hero_image_url: 'https://example.com/images/hero.jpg',
          og_image_url: 'https://example.com/images/og.jpg',
          gallery_images: JSON.stringify([
            'https://example.com/images/gallery-1.jpg',
            'https://example.com/images/gallery-2.jpg',
            'https://example.com/images/gallery-3.jpg',
          ]),
        };

        // Act
        const response = await withApiKey(request(app).post('/api/v1/posts').send(createData));

        // Assert: All URLs saved correctly
        expect(response.status).toBe(201);
        expect(response.body.hero_image_url).toBe(createData.hero_image_url);
        expect(response.body.og_image_url).toBe(createData.og_image_url);
        expect(response.body.gallery_images).toHaveLength(3);
        expect(response.body.gallery_images).toContain('https://example.com/images/gallery-1.jpg');
        expect(response.body.gallery_images).toContain('https://example.com/images/gallery-2.jpg');
        expect(response.body.gallery_images).toContain('https://example.com/images/gallery-3.jpg');
      });

      it('creates post with blocks containing image_url', async () => {
        // Arrange: Post with blocks that have image URLs
        const createData = {
          title: 'Post with Block Image URLs',
          blocks: JSON.stringify([
            {
              type: 'image_full',
              data: {
                image_url: 'https://example.com/images/block-full.jpg',
                alt: 'Full width block image',
                caption: 'Block image caption',
              },
              sort_order: 0,
            },
            {
              type: 'text_image',
              data: {
                text: 'Some text content',
                image_url: 'https://example.com/images/block-text-image.jpg',
                image_alt: 'Text with image',
              },
              sort_order: 1,
            },
          ]),
        };

        // Act
        const response = await withApiKey(request(app).post('/api/v1/posts').send(createData));

        // Assert: Post created with blocks
        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
      });

      it('updates all image URLs at once', async () => {
        // Arrange: Create post with initial URLs
        const initialData = {
          title: 'Post for URL Update',
          hero_image_url: 'https://example.com/images/hero-old.jpg',
          og_image_url: 'https://example.com/images/og-old.jpg',
          gallery_images: JSON.stringify(['https://example.com/images/old-1.jpg']),
        };

        const createResponse = await withApiKey(
          request(app).post('/api/v1/posts').send(initialData)
        );
        const postId = createResponse.body.id;

        // Act: Update all URLs
        const updateData = {
          hero_image_url: 'https://example.com/images/hero-new.jpg',
          og_image_url: 'https://example.com/images/og-new.jpg',
          gallery_images: JSON.stringify([
            'https://example.com/images/new-1.jpg',
            'https://example.com/images/new-2.jpg',
          ]),
        };

        const updateResponse = await withApiKey(
          request(app).put(`/api/v1/posts/${postId}`).send(updateData)
        );

        // Assert: All URLs updated
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.hero_image_url).toBe(updateData.hero_image_url);
        expect(updateResponse.body.og_image_url).toBe(updateData.og_image_url);
        expect(updateResponse.body.gallery_images).toHaveLength(2);

        // Verify with GET
        const getResponse = await withApiKey(request(app).get(`/api/v1/posts/${postId}`));
        expect(getResponse.body.post.hero_image_url).toBe(updateData.hero_image_url);
        expect(getResponse.body.post.og_image_url).toBe(updateData.og_image_url);
      });
    });

    // ==========================================================================
    // Edge Cases
    // ==========================================================================

    describe('Edge Cases', () => {
      it('handles empty string URL to clear hero image', async () => {
        // Arrange: Create post with hero_image_url
        const createData = {
          title: 'Post to Clear Hero Image',
          hero_image_url: 'https://example.com/images/to-clear.jpg',
        };

        const createResponse = await withApiKey(
          request(app).post('/api/v1/posts').send(createData)
        );
        const postId = createResponse.body.id;

        // Act: Update with empty string URL
        const updateData = {
          hero_image_url: '',
        };

        const updateResponse = await withApiKey(
          request(app).put(`/api/v1/posts/${postId}`).send(updateData)
        );

        // Assert: Image cleared (empty string becomes undefined)
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.hero_image_url).toBeUndefined();
      });

      it('accepts very long URL (no validation)', async () => {
        // Arrange: Very long URL (1000+ characters)
        const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '/image.jpg';

        const createData = {
          title: 'Post with Long URL',
          hero_image_url: longUrl,
        };

        // Act
        const response = await withApiKey(request(app).post('/api/v1/posts').send(createData));

        // Assert: URL accepted (no validation)
        expect(response.status).toBe(201);
        expect(response.body.hero_image_url).toBe(longUrl);
      });

      it('accepts URL with special characters', async () => {
        // Arrange: URL with special characters
        const specialUrls = [
          'https://example.com/images/image%20with%20spaces.jpg',
          'https://example.com/images/image?width=800&height=600&quality=90',
          'https://example.com/images/українська-назва.jpg',
          'https://example.com/images/image#section',
          'https://user:password@example.com/images/protected.jpg',
        ];

        for (const url of specialUrls) {
          const createData = {
            title: `Post with Special URL ${url.substring(0, 20)}`,
            hero_image_url: url,
          };

          // Act
          const response = await withApiKey(request(app).post('/api/v1/posts').send(createData));

          // Assert: URL accepted
          expect(response.status).toBe(201);
          expect(response.body.hero_image_url).toBe(url);
        }
      });

      it('preserves existing URLs when not provided in update', async () => {
        // Arrange: Create post with URLs
        const createData = {
          title: 'Post for URL Preservation',
          hero_image_url: 'https://example.com/images/preserve-hero.jpg',
          og_image_url: 'https://example.com/images/preserve-og.jpg',
        };

        const createResponse = await withApiKey(
          request(app).post('/api/v1/posts').send(createData)
        );
        const postId = createResponse.body.id;

        // Act: Update without providing URL fields
        const updateData = {
          title: 'Updated Title Without URLs',
        };

        const updateResponse = await withApiKey(
          request(app).put(`/api/v1/posts/${postId}`).send(updateData)
        );

        // Assert: URLs preserved
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.hero_image_url).toBe(createData.hero_image_url);
        expect(updateResponse.body.og_image_url).toBe(createData.og_image_url);
      });

      it('handles null and undefined URL values correctly', async () => {
        // Arrange: Create post with URL
        const createData = {
          title: 'Post for Null URL Test',
          hero_image_url: 'https://example.com/images/initial.jpg',
        };

        const createResponse = await withApiKey(
          request(app).post('/api/v1/posts').send(createData)
        );
        const postId = createResponse.body.id;

        // Act: Update with null (should clear)
        const updateResponse = await withApiKey(
          request(app).put(`/api/v1/posts/${postId}`).send({
            hero_image_url: null,
          })
        );

        // Assert: Behavior depends on how the route handles null
        expect(updateResponse.status).toBe(200);
      });
    });

    // ==========================================================================
    // File vs URL Priority
    // ==========================================================================

    describe('File vs URL Priority', () => {
      it('file upload takes priority over hero_image_url parameter', async () => {
        // Arrange: Data with both file and URL
        const heroUrlParam = 'https://example.com/images/param-hero.jpg';

        // Act: Create with file AND URL parameter
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .attach('hero_image', Buffer.from('file-hero-data'), 'hero.jpg')
            .field('title', 'Post with File and URL')
            .field('hero_image_url', heroUrlParam)
        );

        // Assert: File URL used (from mocked storageService)
        expect(response.status).toBe(201);
        expect(response.body.hero_image_url).toBe('https://example.com/uploaded-image.jpg');
        expect(response.body.hero_image_url).not.toBe(heroUrlParam);
      });

      it('file upload takes priority over og_image_url parameter', async () => {
        // Arrange
        const ogUrlParam = 'https://example.com/images/param-og.jpg';

        // Act: Create with file AND URL parameter
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .attach('og_image', Buffer.from('file-og-data'), 'og.jpg')
            .field('title', 'Post with File and URL for OG')
            .field('og_image_url', ogUrlParam)
        );

        // Assert: File URL used
        expect(response.status).toBe(201);
        expect(response.body.og_image_url).toBe('https://example.com/uploaded-image.jpg');
        expect(response.body.og_image_url).not.toBe(ogUrlParam);
      });

      it('uses URL when no file is provided', async () => {
        // Arrange
        const heroUrl = 'https://example.com/images/url-only-hero.jpg';

        // Act: Create with URL only (no file)
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .field('title', 'Post with URL Only No File')
            .field('hero_image_url', heroUrl)
        );

        // Assert: URL parameter used
        expect(response.status).toBe(201);
        expect(response.body.hero_image_url).toBe(heroUrl);
      });

      it('update: file replaces existing URL', async () => {
        // Arrange: Create post with URL
        const initialUrl = 'https://example.com/images/initial-url.jpg';
        const createResponse = await withApiKey(
          request(app).post('/api/v1/posts').send({
            title: 'Post for File Replace',
            hero_image_url: initialUrl,
          })
        );
        const postId = createResponse.body.id;

        // Act: Update with file
        const updateResponse = await withApiKey(
          request(app)
            .put(`/api/v1/posts/${postId}`)
            .attach('hero_image', Buffer.from('replacement-file'), 'replacement.jpg')
            .field('title', 'Updated with File')
        );

        // Assert: File URL used
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.hero_image_url).toBe('https://example.com/uploaded-image.jpg');
      });

      it('update: URL parameter replaces existing URL', async () => {
        // Arrange: Create post with URL
        const initialUrl = 'https://example.com/images/initial-to-replace.jpg';
        const createResponse = await withApiKey(
          request(app).post('/api/v1/posts').send({
            title: 'Post for URL Replace',
            hero_image_url: initialUrl,
          })
        );
        const postId = createResponse.body.id;

        // Act: Update with different URL
        const newUrl = 'https://example.com/images/new-replacement.jpg';
        const updateResponse = await withApiKey(
          request(app).put(`/api/v1/posts/${postId}`).send({
            hero_image_url: newUrl,
          })
        );

        // Assert: New URL used
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.hero_image_url).toBe(newUrl);
      });
    });

    // ==========================================================================
    // Gallery URL Scenarios
    // ==========================================================================

    describe('Gallery URL Scenarios', () => {
      it('creates post with gallery_images as URLs', async () => {
        // Arrange
        const galleryUrls = [
          'https://example.com/gallery/1.jpg',
          'https://example.com/gallery/2.jpg',
          'https://example.com/gallery/3.jpg',
        ];

        const createData = {
          title: 'Post with Gallery URLs',
          gallery_images: JSON.stringify(galleryUrls),
        };

        // Act
        const response = await withApiKey(request(app).post('/api/v1/posts').send(createData));

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.gallery_images).toEqual(galleryUrls);
      });

      it('combines existing gallery URLs with new file uploads', async () => {
        // Arrange: Create with gallery URLs
        const existingUrls = ['https://example.com/gallery/existing.jpg'];
        const createResponse = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({
              title: 'Post for Gallery Append',
              gallery_images: JSON.stringify(existingUrls),
            })
        );
        const postId = createResponse.body.id;

        // Act: Add more gallery images via file upload
        const updateResponse = await withApiKey(
          request(app)
            .put(`/api/v1/posts/${postId}`)
            .attach('gallery_images', Buffer.from('new-gallery-1'), 'new1.jpg')
            .attach('gallery_images', Buffer.from('new-gallery-2'), 'new2.jpg')
            .field('gallery_images', JSON.stringify(existingUrls))
        );

        // Assert: Existing + new files
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.gallery_images).toHaveLength(3);
        expect(updateResponse.body.gallery_images).toContain(existingUrls[0]);
      });

      it('replaces gallery with new URLs', async () => {
        // Arrange: Create with initial gallery
        const initialUrls = ['https://example.com/old/1.jpg', 'https://example.com/old/2.jpg'];
        const createResponse = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({
              title: 'Post for Gallery Replace',
              gallery_images: JSON.stringify(initialUrls),
            })
        );
        const postId = createResponse.body.id;

        // Act: Replace with new URLs
        const newUrls = ['https://example.com/new/1.jpg', 'https://example.com/new/2.jpg'];
        const updateResponse = await withApiKey(
          request(app)
            .put(`/api/v1/posts/${postId}`)
            .send({
              gallery_images: JSON.stringify(newUrls),
            })
        );

        // Assert: Gallery replaced
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.gallery_images).toEqual(newUrls);
      });

      it('handles empty gallery_images array', async () => {
        // Arrange
        const createData = {
          title: 'Post with Empty Gallery',
          gallery_images: JSON.stringify([]),
        };

        // Act
        const response = await withApiKey(request(app).post('/api/v1/posts').send(createData));

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.gallery_images).toEqual([]);
      });
    });
  });
});
