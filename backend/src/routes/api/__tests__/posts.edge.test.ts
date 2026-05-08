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

import { TEST_API_KEY, MOCK_POST, createTestApp, withApiKey } from './posts.setup';

describe('Edge Cases', () => {
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

describe('URL Support', () => {
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
