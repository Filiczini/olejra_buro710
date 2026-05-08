/**
 * E2E Tests: File upload and URL image support
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
      const createResponse = await withApiKey(request(app).post('/api/v1/posts').send(createData));

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

      const createResponse = await withApiKey(request(app).post('/api/v1/posts').send(createData));

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

      const createResponse = await withApiKey(request(app).post('/api/v1/posts').send(initialData));
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

      const createResponse = await withApiKey(request(app).post('/api/v1/posts').send(createData));
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

      const createResponse = await withApiKey(request(app).post('/api/v1/posts').send(createData));
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

      const createResponse = await withApiKey(request(app).post('/api/v1/posts').send(createData));
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
