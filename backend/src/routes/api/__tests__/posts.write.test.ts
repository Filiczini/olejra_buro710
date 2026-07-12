import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

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
import { postService } from '../../../services/postService';
import { NotFoundError } from '../../../lib/errors';

import { TEST_API_KEY, MOCK_POST, createTestApp, withApiKey } from './posts.setup';

describe('POST /api/v1/posts', () => {
  let app: ReturnType<typeof createTestApp>;
  let originalApiKey: string | undefined;

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

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = TEST_API_KEY;
  });

  afterEach(() => {
    process.env.API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

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
    expect(response.body.error).toBe('Validation failed');
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
    const response = await withApiKey(request(app).post('/api/v1/posts').send(dataWithLongSeoDesc));

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
    const response = await withApiKey(request(app).post('/api/v1/posts').send(dataWithInvalidJson));

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

describe('PUT /api/v1/posts/:id', () => {
  let app: ReturnType<typeof createTestApp>;
  let originalApiKey: string | undefined;

  const updateData = {
    title: 'Updated Title',
    hero_title: 'Updated Hero Title',
  };

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = TEST_API_KEY;
  });

  afterEach(() => {
    process.env.API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

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

describe('DELETE /api/v1/posts/:id', () => {
  let app: ReturnType<typeof createTestApp>;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = TEST_API_KEY;
  });

  afterEach(() => {
    process.env.API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

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
