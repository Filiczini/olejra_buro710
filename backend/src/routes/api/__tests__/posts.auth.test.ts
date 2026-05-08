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

import { TEST_API_KEY, INVALID_API_KEY, createTestApp, withApiKey } from './posts.setup';

describe('Authentication', () => {
  let app: ReturnType<typeof createTestApp>;
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
