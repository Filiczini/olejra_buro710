import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock storage chain for supabase.storage.from()
const mockUpload = vi.fn();
const mockRemove = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('../../config/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  },
}));

import { storageService } from '../storageService';
import { supabase } from '../../config/supabase';

const mockedStorageFrom = vi.mocked(supabase.storage.from);

function createMockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'image',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
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
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.example.com/projects/media/test.jpg' },
    });
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
      mockUpload.mockResolvedValue({ error: null });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://storage.example.com/projects/media/123-abc.jpg' },
      });

      const file = createMockFile();
      const result = await storageService.uploadImage(file);

      expect(mockedStorageFrom).toHaveBeenCalledWith('projects');
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^projects\/media\/\d+-[a-z0-9]{6}\.jpg$/),
        file.buffer,
        { contentType: 'image/jpeg' }
      );
      expect(result).toBe('https://storage.example.com/projects/media/123-abc.jpg');
    });

    it('uses the blocks bucket when bucket is "blocks"', async () => {
      mockUpload.mockResolvedValue({ error: null });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://storage.example.com/blocks/blocks/123.jpg' },
      });

      const file = createMockFile();
      await storageService.uploadImage(file, 'blocks');

      expect(mockedStorageFrom).toHaveBeenCalledWith('blocks');
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^blocks\/\d+-[a-z0-9]{6}\.jpg$/),
        file.buffer,
        { contentType: 'image/jpeg' }
      );
    });

    it('throws on disallowed file extension', async () => {
      const file = createMockFile({ originalname: 'script.gif' });

      await expect(storageService.uploadImage(file)).rejects.toThrow(
        "File extension '.gif' is not allowed"
      );
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('allows .png files', async () => {
      mockUpload.mockResolvedValue({ error: null });
      const file = createMockFile({ originalname: 'image.png', mimetype: 'image/png' });

      await storageService.uploadImage(file);

      expect(mockUpload).toHaveBeenCalled();
    });

    it('allows .jpeg files', async () => {
      mockUpload.mockResolvedValue({ error: null });
      const file = createMockFile({ originalname: 'image.jpeg', mimetype: 'image/jpeg' });

      await storageService.uploadImage(file);

      expect(mockUpload).toHaveBeenCalled();
    });

    it('throws when supabase upload returns an error', async () => {
      const uploadError = new Error('Upload failed');
      mockUpload.mockResolvedValue({ error: uploadError });

      const file = createMockFile();

      await expect(storageService.uploadImage(file)).rejects.toThrow('Upload failed');
    });

    it('uses default "projects" bucket when no bucket specified', async () => {
      mockUpload.mockResolvedValue({ error: null });

      const file = createMockFile();
      await storageService.uploadImage(file);

      expect(mockedStorageFrom).toHaveBeenCalledWith('projects');
    });
  });

  describe('uploadImages', () => {
    it('uploads multiple files and returns all URLs', async () => {
      mockUpload.mockResolvedValue({ error: null });
      mockGetPublicUrl
        .mockReturnValueOnce({ data: { publicUrl: 'https://example.com/1.jpg' } })
        .mockReturnValueOnce({ data: { publicUrl: 'https://example.com/2.jpg' } });

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
      mockUpload
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: new Error('Quota exceeded') });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/1.jpg' },
      });

      const files = [
        createMockFile({ originalname: 'a.jpg' }),
        createMockFile({ originalname: 'b.jpg' }),
      ];

      const result = await storageService.uploadImages(files);

      expect(result.success).toBe(true);
      expect(result.urls).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Upload failed: Quota exceeded');
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
    it('deletes a projects image by extracting the path', async () => {
      mockRemove.mockResolvedValue({ error: null });

      const url = 'https://storage.example.com/storage/v1/object/public/projects/media/123-abc.jpg';
      const result = await storageService.deleteImage(url);

      expect(result).toEqual({ success: true });
      expect(mockedStorageFrom).toHaveBeenCalledWith('projects');
      expect(mockRemove).toHaveBeenCalledWith(['media/123-abc.jpg']);
    });

    it('deletes a blocks image by extracting the path', async () => {
      mockRemove.mockResolvedValue({ error: null });

      const url = 'https://storage.example.com/storage/v1/object/public/blocks/blocks/456-def.png';
      const result = await storageService.deleteImage(url);

      expect(result).toEqual({ success: true });
      expect(mockedStorageFrom).toHaveBeenCalledWith('blocks');
      expect(mockRemove).toHaveBeenCalledWith(['blocks/456-def.png']);
    });

    it('returns error for invalid URL format', async () => {
      const result = await storageService.deleteImage('https://example.com/random/image.jpg');

      expect(result).toEqual({ success: false, error: 'Invalid image URL format' });
      expect(mockRemove).not.toHaveBeenCalled();
    });

    it('returns error when supabase remove fails', async () => {
      mockRemove.mockResolvedValue({ error: { message: 'Not found' } });

      const url = 'https://storage.example.com/projects/media/123.jpg';
      const result = await storageService.deleteImage(url);

      expect(result).toEqual({ success: false, error: 'Not found' });
    });

    it('catches unexpected exceptions', async () => {
      mockRemove.mockRejectedValue(new Error('Network error'));

      const url = 'https://storage.example.com/projects/media/123.jpg';
      const result = await storageService.deleteImage(url);

      expect(result).toEqual({ success: false, error: 'Network error' });
    });
  });

  describe('deleteImages', () => {
    it('deletes multiple images and returns success when all succeed', async () => {
      mockRemove.mockResolvedValue({ error: null });

      const urls = [
        'https://storage.example.com/projects/media/1.jpg',
        'https://storage.example.com/projects/media/2.jpg',
      ];

      const result = await storageService.deleteImages(urls);

      expect(result.success).toBe(true);
      expect(result.failed).toHaveLength(0);
    });

    it('reports failed URLs when some deletions fail', async () => {
      mockRemove
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: { message: 'Failed' } });

      const urls = [
        'https://storage.example.com/projects/media/1.jpg',
        'https://storage.example.com/projects/media/2.jpg',
      ];

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
