import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../storageService', () => ({
  storageService: {
    uploadImage: vi.fn().mockResolvedValue('https://example.com/uploaded.jpg'),
    deleteImage: vi.fn().mockResolvedValue(undefined),
  },
}));

import { postFileService } from '../postFileService';
import { storageService } from '../storageService';
import type { BlockImageUpload, ProcessImageOptions } from '../postFileService';

const MOCK_FILE = (name: string): Express.Multer.File => ({
  fieldname: name,
  originalname: name,
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]),
  size: 1024,
  stream: {} as Express.Multer.File['stream'],
  destination: '',
  filename: name,
  path: '',
});

describe('postFileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processImage', () => {
    it('uploads new file and deletes existing URL when file is provided', async () => {
      const options: ProcessImageOptions = {
        file: MOCK_FILE('hero.jpg'),
        existingUrl: 'https://example.com/old.jpg',
        folder: 'posts',
      };

      const result = await postFileService.processImage(options);

      expect(storageService.deleteImage).toHaveBeenCalledWith('https://example.com/old.jpg');
      expect(storageService.uploadImage).toHaveBeenCalledWith(options.file, 'posts');
      expect(result).toBe('https://example.com/uploaded.jpg');
    });

    it('returns urlFromBody when no file is provided', async () => {
      const options: ProcessImageOptions = {
        urlFromBody: 'https://example.com/from-body.jpg',
        existingUrl: 'https://example.com/existing.jpg',
        folder: 'posts',
      };

      const result = await postFileService.processImage(options);

      expect(storageService.uploadImage).not.toHaveBeenCalled();
      expect(storageService.deleteImage).not.toHaveBeenCalled();
      expect(result).toBe('https://example.com/from-body.jpg');
    });

    it('returns undefined when urlFromBody is empty string', async () => {
      const options: ProcessImageOptions = {
        urlFromBody: '',
        existingUrl: 'https://example.com/existing.jpg',
        folder: 'posts',
      };

      const result = await postFileService.processImage(options);

      expect(result).toBeUndefined();
    });

    it('falls back to existingUrl when neither file nor urlFromBody is provided', async () => {
      const options: ProcessImageOptions = {
        existingUrl: 'https://example.com/existing.jpg',
        folder: 'posts',
      };

      const result = await postFileService.processImage(options);

      expect(result).toBe('https://example.com/existing.jpg');
    });

    it('returns undefined when nothing is provided', async () => {
      const options: ProcessImageOptions = {
        folder: 'posts',
      };

      const result = await postFileService.processImage(options);

      expect(result).toBeUndefined();
    });
  });

  describe('uploadGalleryImages', () => {
    it('uploads multiple images in parallel', async () => {
      const files = [MOCK_FILE('1.jpg'), MOCK_FILE('2.jpg')];

      const result = await postFileService.uploadGalleryImages(files, 'posts');

      expect(storageService.uploadImage).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        'https://example.com/uploaded.jpg',
        'https://example.com/uploaded.jpg',
      ]);
    });

    it('returns empty array when no files provided', async () => {
      const result = await postFileService.uploadGalleryImages([], 'posts');

      expect(result).toEqual([]);
      expect(storageService.uploadImage).not.toHaveBeenCalled();
    });
  });

  describe('parseGalleryImages', () => {
    it('parses valid JSON array of strings', () => {
      const result = postFileService.parseGalleryImages(
        JSON.stringify(['https://example.com/1.jpg', 'https://example.com/2.jpg'])
      );
      expect(result).toEqual(['https://example.com/1.jpg', 'https://example.com/2.jpg']);
    });

    it('filters out non-string items', () => {
      const result = postFileService.parseGalleryImages(
        JSON.stringify(['https://example.com/1.jpg', 123, null, 'https://example.com/2.jpg'])
      );
      expect(result).toEqual(['https://example.com/1.jpg', 'https://example.com/2.jpg']);
    });

    it('returns empty array for invalid JSON', () => {
      const result = postFileService.parseGalleryImages('not-json');
      expect(result).toEqual([]);
    });

    it('returns empty array for undefined input', () => {
      const result = postFileService.parseGalleryImages(undefined);
      expect(result).toEqual([]);
    });

    it('returns empty array for non-array parsed value', () => {
      const result = postFileService.parseGalleryImages('{"url": "test"}');
      expect(result).toEqual([]);
    });
  });

  describe('processBlockImageUploads', () => {
    it('uploads images and builds map keyed by sort_order', async () => {
      const uploads: BlockImageUpload[] = [
        { sort_order: 0, file: MOCK_FILE('0.jpg') },
        { sort_order: 1, file: MOCK_FILE('1.jpg'), imageSlot: 0 },
        { sort_order: 1, file: MOCK_FILE('2.jpg'), imageSlot: 1 },
      ];

      const result = await postFileService.processBlockImageUploads(uploads, 'blocks');

      expect(Object.keys(result)).toEqual(['0', '1']);
      expect(result[0]).toEqual([{ url: 'https://example.com/uploaded.jpg' }]);
      expect(result[1]).toEqual([
        { url: 'https://example.com/uploaded.jpg', slot: 0 },
        { url: 'https://example.com/uploaded.jpg', slot: 1 },
      ]);
    });
  });

  describe('applyBlockImageUrls', () => {
    it('applies single image_url to block data', () => {
      const blocks = [
        { sort_order: 0, type: 'image_full' as const, data: { image_url: 'old.jpg' } },
        { sort_order: 1, type: 'text_full' as const, data: {} },
      ];

      const uploadMap = {
        0: [{ url: 'new.jpg' }],
      };

      const result = postFileService.applyBlockImageUrls(blocks, uploadMap);

      expect(result[0].data).toEqual({ image_url: 'new.jpg' });
      expect(result[1].data).toEqual({});
    });

    it('applies images array slot updates', () => {
      const blocks = [
        {
          sort_order: 0,
          type: 'three_images' as const,
          data: {
            images: [
              { url: 'old0.jpg', alt: 'a' },
              { url: 'old1.jpg', alt: 'b' },
            ],
          },
        },
      ];

      const uploadMap = {
        0: [
          { url: 'new0.jpg', slot: 0 },
          { url: 'new1.jpg', slot: 1 },
        ],
      };

      const result = postFileService.applyBlockImageUrls(blocks, uploadMap);

      expect(result[0].data.images).toEqual([
        { url: 'new0.jpg', alt: 'a' },
        { url: 'new1.jpg', alt: 'b' },
      ]);
    });

    it('creates images array if missing', () => {
      const blocks = [
        {
          sort_order: 0,
          type: 'three_images' as const,
          data: {},
        },
      ];

      const uploadMap = {
        0: [{ url: 'new.jpg', slot: 0 }],
      };

      const result = postFileService.applyBlockImageUrls(blocks, uploadMap);

      expect(result[0].data.images).toEqual([{ url: 'new.jpg' }]);
    });
  });
});
