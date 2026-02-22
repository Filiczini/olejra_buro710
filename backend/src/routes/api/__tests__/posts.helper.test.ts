/**
 * Unit tests for posts.ts helper functions
 * Tests processUploadedFiles with URL support
 *
 * @module posts.helper.test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock storageService before importing the helper
vi.mock('../../../services/storageService', () => ({
  storageService: {
    uploadImage: vi.fn().mockResolvedValue('https://example.com/uploaded-image.jpg'),
    deleteImage: vi.fn().mockResolvedValue(undefined),
    deleteImages: vi.fn().mockResolvedValue(undefined),
  },
}));

// Import after mocking
import { processUploadedFiles, type ProcessedFiles, type UrlOptions } from '../posts';
import { storageService } from '../../../services/storageService';

// ============================================================================
// Test Constants
// ============================================================================

const MOCK_FILE = (name: string = 'test.jpg', fieldname?: string): Express.Multer.File => ({
  fieldname: fieldname ?? name,
  originalname: name,
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('mock-image-data'),
  size: 1024,
  stream: {} as Express.Multer.File['stream'],
  destination: '',
  filename: name,
  path: '',
});

const UPLOADED_URL = 'https://example.com/uploaded-image.jpg';
const EXTERNAL_HERO_URL = 'https://external.com/hero.jpg';
const EXTERNAL_OG_URL = 'https://external.com/og.jpg';

// ============================================================================
// Tests
// ============================================================================

describe('processUploadedFiles helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // URL Only Tests (No Files)
  // ==========================================================================

  describe('URL only (no files uploaded)', () => {
    it('returns heroImageUrl when hero_image_url provided and no file', async () => {
      // Arrange
      const urls: UrlOptions = { hero_image_url: EXTERNAL_HERO_URL };

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert
      expect(result).toEqual<ProcessedFiles>({
        galleryUrls: [],
        heroImageUrl: EXTERNAL_HERO_URL,
      });
      expect(storageService.uploadImage).not.toHaveBeenCalled();
    });

    it('returns ogImageUrl when og_image_url provided and no file', async () => {
      // Arrange
      const urls: UrlOptions = { og_image_url: EXTERNAL_OG_URL };

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert
      expect(result).toEqual<ProcessedFiles>({
        galleryUrls: [],
        ogImageUrl: EXTERNAL_OG_URL,
      });
      expect(storageService.uploadImage).not.toHaveBeenCalled();
    });

    it('returns both URLs when both hero_image_url and og_image_url provided', async () => {
      // Arrange
      const urls: UrlOptions = {
        hero_image_url: EXTERNAL_HERO_URL,
        og_image_url: EXTERNAL_OG_URL,
      };

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert
      expect(result).toEqual<ProcessedFiles>({
        galleryUrls: [],
        heroImageUrl: EXTERNAL_HERO_URL,
        ogImageUrl: EXTERNAL_OG_URL,
      });
      expect(storageService.uploadImage).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // File Priority Tests (File > URL)
  // ==========================================================================

  describe('File takes priority over URL', () => {
    it('uses uploaded hero file and ignores hero_image_url when file is present', async () => {
      // Arrange
      const files = {
        hero_image: [MOCK_FILE('hero.jpg', 'hero_image')],
      };
      const urls: UrlOptions = { hero_image_url: EXTERNAL_HERO_URL };
      vi.mocked(storageService.uploadImage).mockResolvedValueOnce(UPLOADED_URL);

      // Act
      const result = await processUploadedFiles(files, [], urls);

      // Assert
      expect(result.heroImageUrl).toBe(UPLOADED_URL);
      expect(result.heroImageUrl).not.toBe(EXTERNAL_HERO_URL);
      expect(storageService.uploadImage).toHaveBeenCalledTimes(1);
      expect(storageService.uploadImage).toHaveBeenCalledWith(
        expect.objectContaining({ fieldname: 'hero_image' }),
        'posts'
      );
    });

    it('uses uploaded OG file and ignores og_image_url when file is present', async () => {
      // Arrange
      const files = {
        og_image: [MOCK_FILE('og.jpg', 'og_image')],
      };
      const urls: UrlOptions = { og_image_url: EXTERNAL_OG_URL };
      vi.mocked(storageService.uploadImage).mockResolvedValueOnce(UPLOADED_URL);

      // Act
      const result = await processUploadedFiles(files, [], urls);

      // Assert
      expect(result.ogImageUrl).toBe(UPLOADED_URL);
      expect(result.ogImageUrl).not.toBe(EXTERNAL_OG_URL);
      expect(storageService.uploadImage).toHaveBeenCalledTimes(1);
      expect(storageService.uploadImage).toHaveBeenCalledWith(
        expect.objectContaining({ fieldname: 'og_image' }),
        'posts'
      );
    });

    it('uses file URL for hero and URL for OG when only hero file uploaded', async () => {
      // Arrange
      const files = {
        hero_image: [MOCK_FILE('hero.jpg', 'hero_image')],
      };
      const urls: UrlOptions = {
        hero_image_url: EXTERNAL_HERO_URL,
        og_image_url: EXTERNAL_OG_URL,
      };
      vi.mocked(storageService.uploadImage).mockResolvedValueOnce(UPLOADED_URL);

      // Act
      const result = await processUploadedFiles(files, [], urls);

      // Assert
      expect(result.heroImageUrl).toBe(UPLOADED_URL); // File uploaded
      expect(result.ogImageUrl).toBe(EXTERNAL_OG_URL); // URL used
    });
  });

  // ==========================================================================
  // Empty/Undefined URL Tests
  // ==========================================================================

  describe('Empty/undefined URLs', () => {
    it('returns undefined heroImageUrl when no file and no URL', async () => {
      // Arrange
      const urls: UrlOptions = {};

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert
      expect(result.heroImageUrl).toBeUndefined();
    });

    it('returns undefined ogImageUrl when no file and no URL', async () => {
      // Arrange
      const urls: UrlOptions = {};

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert
      expect(result.ogImageUrl).toBeUndefined();
    });

    it('handles empty string hero_image_url (falsy, treated as no URL)', async () => {
      // Arrange
      const urls: UrlOptions = { hero_image_url: '' };

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert - empty string is falsy, so heroImageUrl should be undefined
      expect(result.heroImageUrl).toBeUndefined();
    });

    it('handles empty string og_image_url (falsy, treated as no URL)', async () => {
      // Arrange
      const urls: UrlOptions = { og_image_url: '' };

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert - empty string is falsy, so ogImageUrl should be undefined
      expect(result.ogImageUrl).toBeUndefined();
    });

    it('returns all undefined when empty options object passed', async () => {
      // Arrange
      const urls: UrlOptions = {};

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert
      expect(result).toEqual<ProcessedFiles>({
        galleryUrls: [],
      });
      expect(result.heroImageUrl).toBeUndefined();
      expect(result.ogImageUrl).toBeUndefined();
    });
  });

  // ==========================================================================
  // Gallery Tests
  // ==========================================================================

  describe('Gallery with existing URLs', () => {
    it('preserves existing gallery URLs when passed', async () => {
      // Arrange
      const existingGallery = [
        'https://example.com/existing1.jpg',
        'https://example.com/existing2.jpg',
      ];

      // Act
      const result = await processUploadedFiles(undefined, existingGallery, {});

      // Assert
      expect(result.galleryUrls).toEqual(existingGallery);
    });

    it('appends new gallery images to existing gallery', async () => {
      // Arrange
      const existingGallery = ['https://example.com/existing1.jpg'];
      const files = {
        gallery_images: [MOCK_FILE('new1.jpg'), MOCK_FILE('new2.jpg')],
      };
      vi.mocked(storageService.uploadImage)
        .mockResolvedValueOnce('https://example.com/new1.jpg')
        .mockResolvedValueOnce('https://example.com/new2.jpg');

      // Act
      const result = await processUploadedFiles(files, existingGallery, {});

      // Assert
      expect(result.galleryUrls).toEqual([
        'https://example.com/existing1.jpg',
        'https://example.com/new1.jpg',
        'https://example.com/new2.jpg',
      ]);
    });

    it('returns empty gallery array when no existing and no new images', async () => {
      // Act
      const result = await processUploadedFiles(undefined, [], {});

      // Assert
      expect(result.galleryUrls).toEqual([]);
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge cases', () => {
    it('accepts any string as valid URL (no URL validation)', async () => {
      // Arrange
      const arbitraryString = 'not-a-valid-url-but-accepted';
      const urls: UrlOptions = { hero_image_url: arbitraryString };

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert - no validation, accepts any string
      expect(result.heroImageUrl).toBe(arbitraryString);
    });

    it('handles undefined files parameter (no files object at all)', async () => {
      // Arrange
      const urls: UrlOptions = { hero_image_url: EXTERNAL_HERO_URL };

      // Act
      const result = await processUploadedFiles(undefined, [], urls);

      // Assert
      expect(result.heroImageUrl).toBe(EXTERNAL_HERO_URL);
      expect(storageService.uploadImage).not.toHaveBeenCalled();
    });

    it('handles empty files object (no files uploaded)', async () => {
      // Arrange
      const files = {};
      const urls: UrlOptions = { hero_image_url: EXTERNAL_HERO_URL };

      // Act
      const result = await processUploadedFiles(files, [], urls);

      // Assert
      expect(result.heroImageUrl).toBe(EXTERNAL_HERO_URL);
      expect(storageService.uploadImage).not.toHaveBeenCalled();
    });

    it('handles missing UrlOptions parameter (defaults to empty object)', async () => {
      // Act - no urls parameter passed
      const result = await processUploadedFiles(undefined, []);

      // Assert
      expect(result).toEqual<ProcessedFiles>({
        galleryUrls: [],
      });
    });
  });

  // ==========================================================================
  // Combined Scenarios
  // ==========================================================================

  describe('Combined scenarios', () => {
    it('handles full upload with all fields', async () => {
      // Arrange
      const files = {
        hero_image: [MOCK_FILE('hero.jpg')],
        og_image: [MOCK_FILE('og.jpg')],
        gallery_images: [MOCK_FILE('gallery1.jpg')],
      };
      const existingGallery = ['https://example.com/existing.jpg'];
      const urls: UrlOptions = {
        hero_image_url: EXTERNAL_HERO_URL, // Should be ignored
        og_image_url: EXTERNAL_OG_URL, // Should be ignored
      };
      vi.mocked(storageService.uploadImage)
        .mockResolvedValueOnce('https://example.com/hero-uploaded.jpg')
        .mockResolvedValueOnce('https://example.com/og-uploaded.jpg')
        .mockResolvedValueOnce('https://example.com/gallery-uploaded.jpg');

      // Act
      const result = await processUploadedFiles(files, existingGallery, urls);

      // Assert
      expect(result.heroImageUrl).toBe('https://example.com/hero-uploaded.jpg');
      expect(result.ogImageUrl).toBe('https://example.com/og-uploaded.jpg');
      expect(result.galleryUrls).toEqual([
        'https://example.com/existing.jpg',
        'https://example.com/gallery-uploaded.jpg',
      ]);
      expect(storageService.uploadImage).toHaveBeenCalledTimes(3);
    });

    it('handles partial file upload with URL fallback', async () => {
      // Arrange
      const files = {
        hero_image: [MOCK_FILE('hero.jpg')],
        // No OG image file
      };
      const urls: UrlOptions = {
        hero_image_url: EXTERNAL_HERO_URL, // Ignored because file present
        og_image_url: EXTERNAL_OG_URL, // Used because no file
      };
      vi.mocked(storageService.uploadImage).mockResolvedValueOnce(UPLOADED_URL);

      // Act
      const result = await processUploadedFiles(files, [], urls);

      // Assert
      expect(result.heroImageUrl).toBe(UPLOADED_URL); // File takes priority
      expect(result.ogImageUrl).toBe(EXTERNAL_OG_URL); // URL fallback
    });
  });
});
