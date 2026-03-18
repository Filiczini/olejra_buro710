import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

// Mock fs/promises
const mockMkdir = vi.fn().mockResolvedValue(undefined);
const mockWriteFile = vi.fn().mockResolvedValue(undefined);
const mockUnlink = vi.fn().mockResolvedValue(undefined);

vi.mock('fs/promises', () => ({
  default: {
    mkdir: (...args: unknown[]) => mockMkdir(...args),
    writeFile: (...args: unknown[]) => mockWriteFile(...args),
    unlink: (...args: unknown[]) => mockUnlink(...args),
  },
}));

import { storageService } from '../storageService';

// Valid JPEG magic bytes (FF D8 FF) followed by dummy data
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...Array(20).fill(0)]);
// Valid PNG magic bytes (89 50 4E 47) followed by dummy data
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, ...Array(20).fill(0)]);

function createMockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  const mimetype = overrides.mimetype || 'image/jpeg';
  const defaultBuffer = mimetype === 'image/png' ? PNG_MAGIC : JPEG_MAGIC;

  return {
    fieldname: 'image',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype,
    size: 1024,
    buffer: defaultBuffer,
    destination: '',
    filename: '',
    path: '',
    stream: null as never,
    ...overrides,
  };
}

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSafeFileName', () => {
    it('generates a filename with correct extension', () => {
      const result = storageService.generateSafeFileName('photo.png');
      expect(result).toMatch(/^\d+-[a-z0-9]{6}\.png$/);
    });

    it('lowercases the extension', () => {
      const result = storageService.generateSafeFileName('photo.JPG');
      expect(result).toMatch(/\.jpg$/);
    });

    it('defaults to jpg when no extension found', () => {
      const result = storageService.generateSafeFileName('noext');
      expect(result).toMatch(/\.noext$/);
    });

    it('generates unique filenames on consecutive calls', () => {
      const a = storageService.generateSafeFileName('img.jpg');
      const b = storageService.generateSafeFileName('img.jpg');
      // Extremely unlikely to collide given timestamp + random
      expect(a).not.toBe(b);
    });
  });

  describe('uploadImage', () => {
    it('uploads a file and returns public URL', async () => {
      const file = createMockFile();
      const result = await storageService.uploadImage(file);

      expect(mockMkdir).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining(path.join('posts')),
        file.buffer
      );
      expect(result).toMatch(/^\/uploads\/posts\/\d+-[a-z0-9]{6}\.jpg$/);
    });

    it('uses the blocks folder when bucket is "blocks"', async () => {
      const file = createMockFile();
      const result = await storageService.uploadImage(file, 'blocks');

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining(path.join('blocks')),
        file.buffer
      );
      expect(result).toMatch(/^\/uploads\/blocks\/\d+-[a-z0-9]{6}\.jpg$/);
    });

    it('throws on disallowed file extension', async () => {
      const file = createMockFile({ originalname: 'script.gif' });

      await expect(storageService.uploadImage(file)).rejects.toThrow(
        "File extension '.gif' is not allowed"
      );
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('allows .png files', async () => {
      const file = createMockFile({ originalname: 'image.png', mimetype: 'image/png' });

      await storageService.uploadImage(file);

      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('allows .jpeg files', async () => {
      const file = createMockFile({ originalname: 'image.jpeg', mimetype: 'image/jpeg' });

      await storageService.uploadImage(file);

      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('throws when write fails', async () => {
      mockWriteFile.mockRejectedValueOnce(new Error('Disk full'));

      const file = createMockFile();

      await expect(storageService.uploadImage(file)).rejects.toThrow('Disk full');
    });

    it('uses default "posts" folder when no bucket specified', async () => {
      const file = createMockFile();
      const result = await storageService.uploadImage(file);

      expect(result).toContain('/uploads/posts/');
    });
  });

  describe('uploadImages', () => {
    it('uploads multiple files and returns all URLs', async () => {
      const files = [
        createMockFile({ originalname: 'a.jpg' }),
        createMockFile({ originalname: 'b.jpg' }),
      ];

      const result = await storageService.uploadImages(files);

      expect(result.success).toBe(true);
      expect(result.urls).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('returns partial success when some uploads fail', async () => {
      mockWriteFile
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Quota exceeded'));

      const files = [
        createMockFile({ originalname: 'a.jpg' }),
        createMockFile({ originalname: 'b.jpg' }),
      ];

      const result = await storageService.uploadImages(files);

      expect(result.success).toBe(true);
      expect(result.urls).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Quota exceeded');
    });

    it('returns success false when all uploads fail', async () => {
      const files = [
        createMockFile({ originalname: 'bad.gif' }),
        createMockFile({ originalname: 'bad2.bmp' }),
      ];

      const result = await storageService.uploadImages(files);

      expect(result.success).toBe(false);
      expect(result.urls).toHaveLength(0);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('deleteImage', () => {
    it('deletes a local image by path', async () => {
      const url = '/uploads/posts/123-abc.jpg';
      const result = await storageService.deleteImage(url);

      expect(result).toEqual({ success: true });
      expect(mockUnlink).toHaveBeenCalled();
    });

    it('deletes a blocks image by path', async () => {
      const url = '/uploads/blocks/456-def.png';
      const result = await storageService.deleteImage(url);

      expect(result).toEqual({ success: true });
      expect(mockUnlink).toHaveBeenCalled();
    });

    it('returns error for invalid URL format', async () => {
      const result = await storageService.deleteImage('https://example.com/random/image.jpg');

      expect(result).toEqual({ success: false, error: 'Invalid image URL format' });
      expect(mockUnlink).not.toHaveBeenCalled();
    });

    it('treats ENOENT as success (file already gone)', async () => {
      const enoent = new Error('File not found') as NodeJS.ErrnoException;
      enoent.code = 'ENOENT';
      mockUnlink.mockRejectedValueOnce(enoent);

      const url = '/uploads/posts/123.jpg';
      const result = await storageService.deleteImage(url);

      expect(result).toEqual({ success: true });
    });

    it('returns error on unexpected exceptions', async () => {
      mockUnlink.mockRejectedValueOnce(new Error('Permission denied'));

      const url = '/uploads/posts/123.jpg';
      const result = await storageService.deleteImage(url);

      expect(result).toEqual({ success: false, error: 'Permission denied' });
    });
  });

  describe('deleteImages', () => {
    it('deletes multiple images and returns success when all succeed', async () => {
      const urls = ['/uploads/posts/1.jpg', '/uploads/posts/2.jpg'];

      const result = await storageService.deleteImages(urls);

      expect(result.success).toBe(true);
      expect(result.failed).toHaveLength(0);
    });

    it('reports failed URLs when some deletions fail', async () => {
      mockUnlink.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Failed'));

      const urls = ['/uploads/posts/1.jpg', '/uploads/posts/2.jpg'];

      const result = await storageService.deleteImages(urls);

      expect(result.success).toBe(false);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toBe(urls[1]);
    });

    it('includes invalid URLs in failed list', async () => {
      const urls = ['https://example.com/invalid/path.jpg'];

      const result = await storageService.deleteImages(urls);

      expect(result.success).toBe(false);
      expect(result.failed).toEqual([urls[0]]);
    });
  });
});
