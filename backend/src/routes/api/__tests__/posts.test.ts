/**
 * Integration tests for Posts API endpoints
 * Tests CRUD operations, authentication, and validation
 *
 * @module posts.test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Application } from 'express';

// Mock modules before importing the route
vi.mock('../../../services/postService', () => ({
  postService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    generateSlug: vi.fn((title: string) =>
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    ),
  },
}));

vi.mock('../../../services/storageService', () => ({
  storageService: {
    uploadImage: vi.fn().mockResolvedValue('https://example.com/image.jpg'),
    deleteImage: vi.fn().mockResolvedValue(undefined),
    deleteImages: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../services/activityLogService', () => ({
  activityLogService: {
    log: vi.fn().mockResolvedValue({}),
  },
}));

// Import after mocking
import postsRouter from '../posts';
import { postService } from '../../../services/postService';
import { AppError, NotFoundError } from '../../../lib/errors';

// ============================================================================
// Test Constants
// ============================================================================

const TEST_API_KEY = 'test-api-key-12345';
const INVALID_API_KEY = 'invalid-key';

const MOCK_POST = {
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

const MOCK_BLOCK = {
  id: 'block-123',
  post_id: 'post-123',
  type: 'text_full' as const,
  data: { content: 'Test content' },
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
};

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
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
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

describe('Posts API', () => {
  let app: Application;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
    // Store and set API key
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = TEST_API_KEY;
  });

  afterEach(() => {
    // Restore original API key
    process.env.API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Authentication Tests
  // ==========================================================================

  describe('Authentication', () => {
    it('returns 401 when X-API-Key header is missing', async () => {
      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'API key is required' });
    });

    it('returns 401 when X-API-Key is invalid', async () => {
      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts'), INVALID_API_KEY);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid API key' });
    });

    it('returns 401 when API_KEY environment variable is not configured', async () => {
      // Arrange
      delete process.env.API_KEY;

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts'), TEST_API_KEY);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'API key authentication unavailable' });
    });

    it('allows access with valid X-API-Key', async () => {
      // Arrange
      vi.mocked(postService.getAll).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts'));

      // Assert
      expect(response.status).toBe(200);
      expect(postService.getAll).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // GET /posts Tests
  // ==========================================================================

  describe('GET /api/v1/posts', () => {
    it('returns paginated list of posts', async () => {
      // Arrange
      const mockResponse = {
        data: [MOCK_POST],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      vi.mocked(postService.getAll).mockResolvedValue(mockResponse);

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts'));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(postService.getAll).toHaveBeenCalledWith({});
    });

    it('filters posts by status', async () => {
      // Arrange
      const mockResponse = {
        data: [MOCK_POST],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      vi.mocked(postService.getAll).mockResolvedValue(mockResponse);

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts?status=draft'));

      // Assert
      expect(response.status).toBe(200);
      expect(postService.getAll).toHaveBeenCalledWith(expect.objectContaining({ status: 'draft' }));
    });

    it('filters posts by search term', async () => {
      // Arrange
      const mockResponse = {
        data: [MOCK_POST],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      vi.mocked(postService.getAll).mockResolvedValue(mockResponse);

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts?search=Test'));

      // Assert
      expect(response.status).toBe(200);
      expect(postService.getAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'Test' }));
    });

    it('applies pagination parameters', async () => {
      // Arrange
      const mockResponse = {
        data: [MOCK_POST],
        pagination: { page: 2, limit: 5, total: 15, totalPages: 3 },
      };
      vi.mocked(postService.getAll).mockResolvedValue(mockResponse);

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts?page=2&limit=5'));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
      expect(postService.getAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
    });

    it('returns empty array when no posts exist', async () => {
      // Arrange
      const mockResponse = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      vi.mocked(postService.getAll).mockResolvedValue(mockResponse);

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts'));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('returns 500 when service throws an error', async () => {
      // Arrange
      vi.mocked(postService.getAll).mockRejectedValue(new Error('Database error'));

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts'));

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  // ==========================================================================
  // GET /posts/:id Tests
  // ==========================================================================

  describe('GET /api/v1/posts/:id', () => {
    it('returns post with blocks for valid ID', async () => {
      // Arrange
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [MOCK_BLOCK],
      });

      // Act
      const response = await withApiKey(request(app).get(`/api/v1/posts/${MOCK_POST.id}`));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        post: MOCK_POST,
        blocks: [MOCK_BLOCK],
      });
      expect(postService.getById).toHaveBeenCalledWith(MOCK_POST.id);
    });

    it('returns 404 for non-existent post ID', async () => {
      // Arrange
      vi.mocked(postService.getById).mockRejectedValue(new NotFoundError('Post not found'));

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts/non-existent-id'));

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Post not found' });
    });

    it('handles UUID format IDs', async () => {
      // Arrange
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      vi.mocked(postService.getById).mockResolvedValue({
        post: { ...MOCK_POST, id: uuidId },
        blocks: [],
      });

      // Act
      const response = await withApiKey(request(app).get(`/api/v1/posts/${uuidId}`));

      // Assert
      expect(response.status).toBe(200);
      expect(postService.getById).toHaveBeenCalledWith(uuidId);
    });
  });

  // ==========================================================================
  // POST /posts Tests
  // ==========================================================================

  describe('POST /api/v1/posts', () => {
    const validPostData = {
      title: 'New Test Post',
      slug: 'new-test-post',
      status: 'draft',
      hero_title: 'Hero Title',
      hero_subtitle: 'Hero Subtitle',
      hero_tags: JSON.stringify(['tag1', 'tag2']),
      hero_location: 'Kyiv',
      hero_year: '2024',
      seo_title: 'SEO Title',
      seo_description: 'SEO Description',
    };

    it('creates post with valid data and returns 201', async () => {
      // Arrange
      vi.mocked(postService.create).mockResolvedValue(MOCK_POST);

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(validPostData));

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(MOCK_POST);
      expect(postService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: validPostData.title,
          slug: validPostData.slug,
          status: 'draft',
          hero_tags: ['tag1', 'tag2'],
        })
      );
    });

    it('returns 400 when title is missing', async () => {
      // Arrange
      const { title, ...dataWithoutTitle } = validPostData;

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(dataWithoutTitle));

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });

    it('returns 400 when title exceeds max length', async () => {
      // Arrange
      const longTitle = 'a'.repeat(201);
      const dataWithLongTitle = { ...validPostData, title: longTitle };

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(dataWithLongTitle));

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'title',
          message: expect.stringContaining('200'),
        })
      );
    });

    it('returns 400 when slug exceeds max length', async () => {
      // Arrange
      const longSlug = 'a'.repeat(201);
      const dataWithLongSlug = { ...validPostData, slug: longSlug };

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(dataWithLongSlug));

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'slug',
          message: expect.stringContaining('200'),
        })
      );
    });

    it('returns 400 when SEO title exceeds max length', async () => {
      // Arrange
      const longSeoTitle = 'a'.repeat(61);
      const dataWithLongSeoTitle = { ...validPostData, seo_title: longSeoTitle };

      // Act
      const response = await withApiKey(
        request(app).post('/api/v1/posts').send(dataWithLongSeoTitle)
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'seo_title',
          message: expect.stringContaining('60'),
        })
      );
    });

    it('returns 400 when SEO description exceeds max length', async () => {
      // Arrange
      const longSeoDesc = 'a'.repeat(161);
      const dataWithLongSeoDesc = {
        ...validPostData,
        seo_description: longSeoDesc,
      };

      // Act
      const response = await withApiKey(
        request(app).post('/api/v1/posts').send(dataWithLongSeoDesc)
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

    it('returns 400 when hero_tags is invalid JSON', async () => {
      // Arrange
      const dataWithInvalidJson = {
        ...validPostData,
        hero_tags: 'not-valid-json',
      };

      // Act
      const response = await withApiKey(
        request(app).post('/api/v1/posts').send(dataWithInvalidJson)
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid hero_tags format' });
    });

    it('returns 400 when blocks is invalid JSON', async () => {
      // Arrange
      const dataWithInvalidBlocks = {
        ...validPostData,
        blocks: 'not-valid-json',
      };

      // Act
      const response = await withApiKey(
        request(app).post('/api/v1/posts').send(dataWithInvalidBlocks)
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid blocks format' });
    });

    it('creates post with auto-generated slug when not provided', async () => {
      // Arrange
      const { slug, ...dataWithoutSlug } = validPostData;
      vi.mocked(postService.create).mockResolvedValue(MOCK_POST);
      vi.mocked(postService.generateSlug).mockReturnValue('new-test-post');

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(dataWithoutSlug));

      // Assert
      expect(response.status).toBe(201);
      expect(postService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'new-test-post',
        })
      );
    });

    it('creates post with published status', async () => {
      // Arrange
      const publishedPost = { ...MOCK_POST, status: 'published' as const };
      vi.mocked(postService.create).mockResolvedValue(publishedPost);
      const publishedData = { ...validPostData, status: 'published' };

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(publishedData));

      // Assert
      expect(response.status).toBe(201);
      expect(postService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
        })
      );
    });

    it('creates post with blocks', async () => {
      // Arrange
      const blocks = [{ type: 'text_full', data: { content: 'Test content' }, sort_order: 0 }];
      const dataWithBlocks = {
        ...validPostData,
        blocks: JSON.stringify(blocks),
      };
      vi.mocked(postService.create).mockResolvedValue(MOCK_POST);

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(dataWithBlocks));

      // Assert
      expect(response.status).toBe(201);
      expect(postService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'text_full',
              data: { content: 'Test content' },
              sort_order: 0,
            }),
          ]),
        })
      );
    });

    it('returns 500 when service throws an error', async () => {
      // Arrange
      vi.mocked(postService.create).mockRejectedValue(new Error('Database error'));

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(validPostData));

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  // ==========================================================================
  // PUT /posts/:id Tests
  // ==========================================================================

  describe('PUT /api/v1/posts/:id', () => {
    const updateData = {
      title: 'Updated Title',
      hero_title: 'Updated Hero Title',
    };

    it('updates post and returns 200', async () => {
      // Arrange
      const updatedPost = { ...MOCK_POST, ...updateData };
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      vi.mocked(postService.update).mockResolvedValue(updatedPost);

      // Act
      const response = await withApiKey(
        request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send(updateData)
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedPost);
      expect(postService.update).toHaveBeenCalledWith(
        MOCK_POST.id,
        expect.objectContaining(updateData)
      );
    });

    it('returns 404 for non-existent post ID', async () => {
      // Arrange
      vi.mocked(postService.getById).mockRejectedValue(new NotFoundError('Post not found'));

      // Act
      const response = await withApiKey(
        request(app).put('/api/v1/posts/non-existent-id').send(updateData)
      );

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Post not found' });
    });

    it('supports partial update (only title)', async () => {
      // Arrange
      const partialUpdate = { title: 'Only Title Updated' };
      const updatedPost = { ...MOCK_POST, title: 'Only Title Updated' };
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      vi.mocked(postService.update).mockResolvedValue(updatedPost);

      // Act
      const response = await withApiKey(
        request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send(partialUpdate)
      );

      // Assert
      expect(response.status).toBe(200);
      expect(postService.update).toHaveBeenCalledWith(
        MOCK_POST.id,
        expect.objectContaining({ title: 'Only Title Updated' })
      );
    });

    it('supports partial update (only status)', async () => {
      // Arrange
      const partialUpdate = { status: 'published' };
      const updatedPost = { ...MOCK_POST, status: 'published' as const };
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      vi.mocked(postService.update).mockResolvedValue(updatedPost);

      // Act
      const response = await withApiKey(
        request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send(partialUpdate)
      );

      // Assert
      expect(response.status).toBe(200);
      expect(postService.update).toHaveBeenCalledWith(
        MOCK_POST.id,
        expect.objectContaining({ status: 'published' })
      );
    });

    it('returns 400 when title exceeds max length', async () => {
      // Arrange
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      const longTitle = 'a'.repeat(201);
      const dataWithLongTitle = { ...updateData, title: longTitle };

      // Act
      const response = await withApiKey(
        request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send(dataWithLongTitle)
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'title',
          message: expect.stringContaining('200'),
        })
      );
    });

    it('returns 400 when trying to set duplicate slug', async () => {
      // Arrange
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      const { ConflictError } = await import('../../../lib/errors');
      vi.mocked(postService.update).mockRejectedValue(new ConflictError('Slug already exists'));

      // Act
      const response = await withApiKey(
        request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send({ slug: 'existing-slug' })
      );

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'Slug already exists' });
    });

    it('updates blocks when provided', async () => {
      // Arrange
      const newBlocks = [{ type: 'text_full', data: { content: 'New content' }, sort_order: 0 }];
      const updateWithBlocks = { blocks: JSON.stringify(newBlocks) };
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      vi.mocked(postService.update).mockResolvedValue(MOCK_POST);

      // Act
      const response = await withApiKey(
        request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send(updateWithBlocks)
      );

      // Assert
      expect(response.status).toBe(200);
      expect(postService.update).toHaveBeenCalledWith(
        MOCK_POST.id,
        expect.objectContaining({
          blocks: expect.any(Array),
        })
      );
    });

    it('returns 500 when service throws unexpected error', async () => {
      // Arrange
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      vi.mocked(postService.update).mockRejectedValue(new Error('Unexpected error'));

      // Act
      const response = await withApiKey(
        request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send(updateData)
      );

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  // ==========================================================================
  // DELETE /posts/:id Tests
  // ==========================================================================

  describe('DELETE /api/v1/posts/:id', () => {
    it('deletes existing post and returns success message', async () => {
      // Arrange
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      vi.mocked(postService.delete).mockResolvedValue(undefined);

      // Act
      const response = await withApiKey(request(app).delete(`/api/v1/posts/${MOCK_POST.id}`));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Post deleted successfully' });
      expect(postService.delete).toHaveBeenCalledWith(MOCK_POST.id);
    });

    it('returns 404 for non-existent post ID', async () => {
      // Arrange
      vi.mocked(postService.getById).mockRejectedValue(new NotFoundError('Post not found'));

      // Act
      const response = await withApiKey(request(app).delete('/api/v1/posts/non-existent-id'));

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Post not found' });
    });

    it('returns 500 when delete service throws error', async () => {
      // Arrange
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      vi.mocked(postService.delete).mockRejectedValue(new Error('Database error'));

      // Act
      const response = await withApiKey(request(app).delete(`/api/v1/posts/${MOCK_POST.id}`));

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles concurrent requests independently', async () => {
      // Arrange
      vi.mocked(postService.getAll).mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      // Act - Make multiple concurrent requests
      const requests = Array(5)
        .fill(null)
        .map(() => withApiKey(request(app).get('/api/v1/posts')));

      const responses = await Promise.all(requests);

      // Assert - All should succeed
      responses.forEach((response: request.Response) => {
        expect(response.status).toBe(200);
      });
    });

    it('handles empty request body gracefully', async () => {
      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send({}));

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });

    it('handles undefined values in request body', async () => {
      // Arrange
      vi.mocked(postService.getById).mockResolvedValue({
        post: MOCK_POST,
        blocks: [],
      });
      vi.mocked(postService.update).mockResolvedValue(MOCK_POST);

      // Act - Send update with undefined values
      const response = await withApiKey(
        request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send({ title: undefined })
      );

      // Assert - Should still work (undefined fields are ignored)
      expect(response.status).toBe(200);
    });

    it('handles special characters in title', async () => {
      // Arrange
      const specialTitle = 'Test\'s Post with <special> & "quotes"';
      const specialData = {
        title: specialTitle,
        slug: 'test-special-chars',
      };
      vi.mocked(postService.create).mockResolvedValue({
        ...MOCK_POST,
        title: specialTitle,
      });

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(specialData));

      // Assert
      expect(response.status).toBe(201);
      expect(postService.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: specialTitle })
      );
    });

    it('handles Unicode characters in title', async () => {
      // Arrange
      const unicodeTitle = 'Тестовий пост 中文 العربية';
      const unicodeData = {
        title: unicodeTitle,
        slug: 'test-unicode',
      };
      vi.mocked(postService.create).mockResolvedValue({
        ...MOCK_POST,
        title: unicodeTitle,
      });

      // Act
      const response = await withApiKey(request(app).post('/api/v1/posts').send(unicodeData));

      // Assert
      expect(response.status).toBe(201);
      expect(postService.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: unicodeTitle })
      );
    });

    it('handles very long pagination parameters', async () => {
      // Arrange
      vi.mocked(postService.getAll).mockResolvedValue({
        data: [],
        pagination: { page: 9999, limit: 100, total: 0, totalPages: 0 },
      });

      // Act
      const response = await withApiKey(request(app).get('/api/v1/posts?page=9999&limit=100'));

      // Assert
      expect(response.status).toBe(200);
      expect(postService.getAll).toHaveBeenCalledWith({ page: 9999, limit: 100 });
    });
  });

  // ==========================================================================
  // URL Support Tests
  // ==========================================================================

  describe('URL Support', () => {
    const validPostData = {
      title: 'New Test Post',
      slug: 'new-test-post',
      status: 'draft',
      hero_title: 'Hero Title',
      hero_subtitle: 'Hero Subtitle',
      hero_tags: JSON.stringify(['tag1', 'tag2']),
      hero_location: 'Kyiv',
      hero_year: '2024',
      seo_title: 'SEO Title',
      seo_description: 'SEO Description',
    };

    // --------------------------------------------------------------------------
    // POST with URLs
    // --------------------------------------------------------------------------

    describe('POST /api/v1/posts with URLs', () => {
      it('creates post with hero_image_url (JSON) and returns 201', async () => {
        // Arrange
        const heroUrl = 'https://example.com/hero-image.jpg';
        const expectedPost = {
          ...MOCK_POST,
          hero_image_url: heroUrl,
        };
        vi.mocked(postService.create).mockResolvedValue(expectedPost);

        // Act
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({ ...validPostData, hero_image_url: heroUrl })
        );

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.hero_image_url).toBe(heroUrl);
        expect(postService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            hero_image_url: heroUrl,
          })
        );
      });

      it('creates post with og_image_url (JSON) and returns 201', async () => {
        // Arrange
        const ogUrl = 'https://example.com/og-image.jpg';
        const expectedPost = {
          ...MOCK_POST,
          og_image_url: ogUrl,
        };
        vi.mocked(postService.create).mockResolvedValue(expectedPost);

        // Act
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({ ...validPostData, og_image_url: ogUrl })
        );

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.og_image_url).toBe(ogUrl);
        expect(postService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            og_image_url: ogUrl,
          })
        );
      });

      it('creates post with both hero_image_url and og_image_url and returns 201', async () => {
        // Arrange
        const heroUrl = 'https://example.com/hero-image.jpg';
        const ogUrl = 'https://example.com/og-image.jpg';
        const expectedPost = {
          ...MOCK_POST,
          hero_image_url: heroUrl,
          og_image_url: ogUrl,
        };
        vi.mocked(postService.create).mockResolvedValue(expectedPost);

        // Act
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({ ...validPostData, hero_image_url: heroUrl, og_image_url: ogUrl })
        );

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.hero_image_url).toBe(heroUrl);
        expect(response.body.og_image_url).toBe(ogUrl);
        expect(postService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            hero_image_url: heroUrl,
            og_image_url: ogUrl,
          })
        );
      });

      it('creates post with gallery_images (URLs array) and returns 201', async () => {
        // Arrange
        const galleryUrls = [
          'https://example.com/gallery-1.jpg',
          'https://example.com/gallery-2.jpg',
          'https://example.com/gallery-3.jpg',
        ];
        const expectedPost = {
          ...MOCK_POST,
          gallery_images: galleryUrls,
        };
        vi.mocked(postService.create).mockResolvedValue(expectedPost);

        // Act
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({ ...validPostData, gallery_images: JSON.stringify(galleryUrls) })
        );

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.gallery_images).toEqual(galleryUrls);
        expect(postService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            gallery_images: galleryUrls,
          })
        );
      });

      it('uses file upload over hero_image_url when both provided', async () => {
        // Arrange
        const uploadedUrl = 'https://example.com/image.jpg'; // Mock returns this
        const heroUrlFromBody = 'https://example.com/hero-from-url.jpg';
        vi.mocked(postService.create).mockResolvedValue({
          ...MOCK_POST,
          hero_image_url: uploadedUrl,
        });

        // Act - Send multipart with file and URL
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .field('title', validPostData.title)
            .field('slug', validPostData.slug)
            .field('hero_image_url', heroUrlFromBody)
            .attach('hero_image', Buffer.from('fake-image'), 'hero.jpg')
        );

        // Assert - File URL should be used, not the URL from body
        expect(response.status).toBe(201);
        expect(response.body.hero_image_url).toBe(uploadedUrl);
        // storageService.uploadImage should have been called for the file
        expect(postService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            hero_image_url: uploadedUrl,
          })
        );
      });

      it('uses file upload over og_image_url when both provided', async () => {
        // Arrange
        const uploadedUrl = 'https://example.com/image.jpg'; // Mock returns this
        const ogUrlFromBody = 'https://example.com/og-from-url.jpg';
        vi.mocked(postService.create).mockResolvedValue({
          ...MOCK_POST,
          og_image_url: uploadedUrl,
        });

        // Act - Send multipart with file and URL
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .field('title', validPostData.title)
            .field('slug', validPostData.slug)
            .field('og_image_url', ogUrlFromBody)
            .attach('og_image', Buffer.from('fake-image'), 'og.jpg')
        );

        // Assert - File URL should be used
        expect(response.status).toBe(201);
        expect(response.body.og_image_url).toBe(uploadedUrl);
        expect(postService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            og_image_url: uploadedUrl,
          })
        );
      });
    });

    // --------------------------------------------------------------------------
    // PUT with URLs
    // --------------------------------------------------------------------------

    describe('PUT /api/v1/posts/:id with URLs', () => {
      it('updates hero_image_url and returns 200', async () => {
        // Arrange
        const newHeroUrl = 'https://example.com/new-hero.jpg';
        const updatedPost = {
          ...MOCK_POST,
          hero_image_url: newHeroUrl,
        };
        vi.mocked(postService.getById).mockResolvedValue({
          post: MOCK_POST,
          blocks: [],
        });
        vi.mocked(postService.update).mockResolvedValue(updatedPost);

        // Act
        const response = await withApiKey(
          request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send({ hero_image_url: newHeroUrl })
        );

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.hero_image_url).toBe(newHeroUrl);
        expect(postService.update).toHaveBeenCalledWith(
          MOCK_POST.id,
          expect.objectContaining({
            hero_image_url: newHeroUrl,
          })
        );
      });

      it('updates og_image_url and returns 200', async () => {
        // Arrange
        const newOgUrl = 'https://example.com/new-og.jpg';
        const updatedPost = {
          ...MOCK_POST,
          og_image_url: newOgUrl,
        };
        vi.mocked(postService.getById).mockResolvedValue({
          post: MOCK_POST,
          blocks: [],
        });
        vi.mocked(postService.update).mockResolvedValue(updatedPost);

        // Act
        const response = await withApiKey(
          request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send({ og_image_url: newOgUrl })
        );

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.og_image_url).toBe(newOgUrl);
        expect(postService.update).toHaveBeenCalledWith(
          MOCK_POST.id,
          expect.objectContaining({
            og_image_url: newOgUrl,
          })
        );
      });

      it('clears hero_image_url when empty string provided', async () => {
        // Arrange
        const postWithHero = {
          ...MOCK_POST,
          hero_image_url: 'https://example.com/existing-hero.jpg',
        };
        const updatedPost = {
          ...MOCK_POST,
          hero_image_url: undefined,
        };
        vi.mocked(postService.getById).mockResolvedValue({
          post: postWithHero,
          blocks: [],
        });
        vi.mocked(postService.update).mockResolvedValue(updatedPost);

        // Act
        const response = await withApiKey(
          request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send({ hero_image_url: '' })
        );

        // Assert
        expect(response.status).toBe(200);
        expect(postService.update).toHaveBeenCalledWith(
          MOCK_POST.id,
          expect.objectContaining({
            hero_image_url: undefined,
          })
        );
      });

      it('clears og_image_url when empty string provided', async () => {
        // Arrange
        const postWithOg = {
          ...MOCK_POST,
          og_image_url: 'https://example.com/existing-og.jpg',
        };
        const updatedPost = {
          ...MOCK_POST,
          og_image_url: undefined,
        };
        vi.mocked(postService.getById).mockResolvedValue({
          post: postWithOg,
          blocks: [],
        });
        vi.mocked(postService.update).mockResolvedValue(updatedPost);

        // Act
        const response = await withApiKey(
          request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send({ og_image_url: '' })
        );

        // Assert
        expect(response.status).toBe(200);
        expect(postService.update).toHaveBeenCalledWith(
          MOCK_POST.id,
          expect.objectContaining({
            og_image_url: undefined,
          })
        );
      });

      it('preserves existing hero_image_url when not provided in update', async () => {
        // Arrange
        const existingHeroUrl = 'https://example.com/existing-hero.jpg';
        const postWithHero = {
          ...MOCK_POST,
          hero_image_url: existingHeroUrl,
        };
        vi.mocked(postService.getById).mockResolvedValue({
          post: postWithHero,
          blocks: [],
        });
        vi.mocked(postService.update).mockResolvedValue(postWithHero);

        // Act - Update without hero_image_url
        const response = await withApiKey(
          request(app).put(`/api/v1/posts/${MOCK_POST.id}`).send({ title: 'Updated Title' })
        );

        // Assert - Existing URL should be preserved
        expect(response.status).toBe(200);
        expect(postService.update).toHaveBeenCalledWith(
          MOCK_POST.id,
          expect.objectContaining({
            hero_image_url: existingHeroUrl,
          })
        );
      });

      it('uses file upload over hero_image_url when both provided on update', async () => {
        // Arrange
        const uploadedUrl = 'https://example.com/image.jpg'; // Mock returns this
        const heroUrlFromBody = 'https://example.com/hero-from-url.jpg';
        vi.mocked(postService.getById).mockResolvedValue({
          post: MOCK_POST,
          blocks: [],
        });
        vi.mocked(postService.update).mockResolvedValue({
          ...MOCK_POST,
          hero_image_url: uploadedUrl,
        });

        // Act - Send multipart with file and URL
        const response = await withApiKey(
          request(app)
            .put(`/api/v1/posts/${MOCK_POST.id}`)
            .field('hero_image_url', heroUrlFromBody)
            .attach('hero_image', Buffer.from('fake-image'), 'hero.jpg')
        );

        // Assert - File URL should be used
        expect(response.status).toBe(200);
        expect(response.body.hero_image_url).toBe(uploadedUrl);
        expect(postService.update).toHaveBeenCalledWith(
          MOCK_POST.id,
          expect.objectContaining({
            hero_image_url: uploadedUrl,
          })
        );
      });

      it('uses file upload over og_image_url when both provided on update', async () => {
        // Arrange
        const uploadedUrl = 'https://example.com/image.jpg'; // Mock returns this
        const ogUrlFromBody = 'https://example.com/og-from-url.jpg';
        vi.mocked(postService.getById).mockResolvedValue({
          post: MOCK_POST,
          blocks: [],
        });
        vi.mocked(postService.update).mockResolvedValue({
          ...MOCK_POST,
          og_image_url: uploadedUrl,
        });

        // Act - Send multipart with file and URL
        const response = await withApiKey(
          request(app)
            .put(`/api/v1/posts/${MOCK_POST.id}`)
            .field('og_image_url', ogUrlFromBody)
            .attach('og_image', Buffer.from('fake-image'), 'og.jpg')
        );

        // Assert - File URL should be used
        expect(response.status).toBe(200);
        expect(response.body.og_image_url).toBe(uploadedUrl);
        expect(postService.update).toHaveBeenCalledWith(
          MOCK_POST.id,
          expect.objectContaining({
            og_image_url: uploadedUrl,
          })
        );
      });
    });

    // --------------------------------------------------------------------------
    // URL Validation Edge Cases
    // --------------------------------------------------------------------------

    describe('URL validation edge cases', () => {
      it('accepts valid external URLs', async () => {
        // Arrange
        const validUrls = [
          'https://cdn.example.com/image.jpg',
          'https://example.com/path/to/image.png',
          'https://s3.amazonaws.com/bucket/image.jpg',
        ];
        vi.mocked(postService.create).mockResolvedValue({
          ...MOCK_POST,
          hero_image_url: validUrls[0],
          og_image_url: validUrls[1],
          gallery_images: validUrls,
        });

        // Act
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({
              ...validPostData,
              hero_image_url: validUrls[0],
              og_image_url: validUrls[1],
              gallery_images: JSON.stringify(validUrls),
            })
        );

        // Assert
        expect(response.status).toBe(201);
      });

      it('handles empty gallery_images array', async () => {
        // Arrange
        vi.mocked(postService.create).mockResolvedValue({
          ...MOCK_POST,
          gallery_images: [],
        });

        // Act
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({ ...validPostData, gallery_images: JSON.stringify([]) })
        );

        // Assert
        expect(response.status).toBe(201);
        expect(postService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            gallery_images: [],
          })
        );
      });

      it('handles single image in gallery_images', async () => {
        // Arrange
        const singleGallery = ['https://example.com/single.jpg'];
        vi.mocked(postService.create).mockResolvedValue({
          ...MOCK_POST,
          gallery_images: singleGallery,
        });

        // Act
        const response = await withApiKey(
          request(app)
            .post('/api/v1/posts')
            .send({ ...validPostData, gallery_images: JSON.stringify(singleGallery) })
        );

        // Assert
        expect(response.status).toBe(201);
        expect(postService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            gallery_images: singleGallery,
          })
        );
      });
    });
  });
});
