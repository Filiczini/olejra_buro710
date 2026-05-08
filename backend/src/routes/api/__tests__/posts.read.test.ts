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

import { TEST_API_KEY, MOCK_POST, MOCK_BLOCK, createTestApp, withApiKey } from './posts.setup';

describe('GET /api/v1/posts', () => {
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

describe('GET /api/v1/posts/:id', () => {
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
