import { describe, it, expect, vi, beforeEach } from 'vitest';

// Chainable mock for Supabase query builder
const createChainMock = (
  resolvedValue: { data?: unknown; error?: unknown; count?: number | null } = {
    data: null,
    error: null,
  }
) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = () => chain;

  chain.select = vi.fn().mockReturnValue(self());
  chain.insert = vi.fn().mockReturnValue(self());
  chain.update = vi.fn().mockReturnValue(self());
  chain.delete = vi.fn().mockReturnValue(self());
  chain.eq = vi.fn().mockReturnValue(self());
  chain.neq = vi.fn().mockReturnValue(self());
  chain.is = vi.fn().mockReturnValue(self());
  chain.ilike = vi.fn().mockReturnValue(self());
  chain.order = vi.fn().mockReturnValue(self());
  chain.range = vi.fn().mockResolvedValue(resolvedValue);
  chain.limit = vi.fn().mockResolvedValue(resolvedValue);
  chain.single = vi.fn().mockResolvedValue(resolvedValue);

  return chain;
};

let mockChain = createChainMock();

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

vi.mock('../blockService', () => ({
  blockService: {
    getByPostId: vi.fn(),
    create: vi.fn(),
    syncBlocks: vi.fn(),
  },
}));

vi.mock('../storageService', () => ({
  storageService: {
    deleteImages: vi.fn().mockResolvedValue(undefined),
  },
}));

import { postService } from '../postService';
import { supabase } from '../../config/supabase';
import { blockService } from '../blockService';
import { storageService } from '../storageService';

const mockedFrom = vi.mocked(supabase.from);
const mockedBlockService = vi.mocked(blockService);
const mockedStorageService = vi.mocked(storageService);

describe('postService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = createChainMock();
    mockedFrom.mockReturnValue(mockChain as never);
  });

  describe('getAll', () => {
    it('returns paginated posts with default params', async () => {
      const mockPosts = [
        { id: 'p1', title: 'Post 1', slug: 'post-1', status: 'published' },
        { id: 'p2', title: 'Post 2', slug: 'post-2', status: 'draft' },
      ];

      mockChain.range = vi.fn().mockResolvedValue({ data: mockPosts, error: null, count: 2 });

      const result = await postService.getAll();

      expect(mockedFrom).toHaveBeenCalledWith('posts');
      expect(mockChain.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockChain.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual({
        data: mockPosts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
    });

    it('applies status filter when provided', async () => {
      mockChain.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });

      await postService.getAll({ status: 'published' });

      expect(mockChain.eq).toHaveBeenCalledWith('status', 'published');
    });

    it('applies search filter when provided', async () => {
      mockChain.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });

      await postService.getAll({ search: 'test' });

      expect(mockChain.ilike).toHaveBeenCalledWith('title', '%test%');
    });

    it('calculates correct pagination range', async () => {
      mockChain.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 25 });

      await postService.getAll({ page: 3, limit: 5 });

      expect(mockChain.range).toHaveBeenCalledWith(10, 14);
    });

    it('throws when supabase returns an error', async () => {
      mockChain.range = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB error' }, count: null });

      await expect(postService.getAll()).rejects.toEqual({ message: 'DB error' });
    });
  });

  describe('getById', () => {
    it('returns post with blocks', async () => {
      const mockPost = { id: 'p1', title: 'Post 1', slug: 'post-1' };
      const mockBlocks = [
        { id: 'b1', post_id: 'p1', type: 'text_full', data: { content: 'Hi' }, sort_order: 0 },
      ];

      mockChain.single = vi.fn().mockResolvedValue({ data: mockPost, error: null });
      mockedBlockService.getByPostId.mockResolvedValue(mockBlocks as never);

      const result = await postService.getById('p1');

      expect(mockedFrom).toHaveBeenCalledWith('posts');
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'p1');
      expect(mockedBlockService.getByPostId).toHaveBeenCalledWith('p1');
      expect(result).toEqual({ post: mockPost, blocks: mockBlocks });
    });

    it('throws when post is not found', async () => {
      mockChain.single = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Not found', code: 'PGRST116' } });

      await expect(postService.getById('nonexistent')).rejects.toEqual({
        message: 'Not found',
        code: 'PGRST116',
      });
    });
  });

  describe('getBySlug', () => {
    it('returns published post with blocks', async () => {
      const mockPost = { id: 'p1', title: 'Post 1', slug: 'my-post', status: 'published' };
      const mockBlocks = [
        { id: 'b1', post_id: 'p1', type: 'text_full', data: { content: 'Hi' }, sort_order: 0 },
      ];

      mockChain.single = vi.fn().mockResolvedValue({ data: mockPost, error: null });
      mockedBlockService.getByPostId.mockResolvedValue(mockBlocks as never);

      const result = await postService.getBySlug('my-post');

      expect(mockChain.eq).toHaveBeenCalledWith('slug', 'my-post');
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'published');
      expect(result).toEqual({ post: mockPost, blocks: mockBlocks });
    });
  });

  describe('create', () => {
    it('creates a new post with generated slug', async () => {
      const mockPost = { id: 'p1', title: 'My New Post', slug: 'my-new-post', status: 'draft' };

      // First call to check slug uniqueness returns no existing post
      const singleMock = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: null }) // slug check
        .mockResolvedValueOnce({ data: mockPost, error: null }); // insert

      mockChain.single = singleMock;

      const result = await postService.create({
        title: 'My New Post',
        slug: 'my-new-post',
        hero_image_url: '',
        hero_title: '',
        hero_subtitle: '',
        hero_tags: [],
        hero_location: '',
        hero_year: '',
      });

      expect(mockChain.insert).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    it('creates blocks when provided', async () => {
      const mockPost = { id: 'p1', title: 'Post', slug: 'post', status: 'draft' };

      mockChain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: null }) // slug check
        .mockResolvedValueOnce({ data: mockPost, error: null }); // insert

      mockedBlockService.create.mockResolvedValue([] as never);

      await postService.create({
        title: 'Post',
        slug: 'post',
        hero_image_url: '',
        hero_title: '',
        hero_subtitle: '',
        hero_tags: [],
        hero_location: '',
        hero_year: '',
        blocks: [{ type: 'text_full', data: { content: 'Hello' } }],
      });

      expect(mockedBlockService.create).toHaveBeenCalledWith({
        postId: 'p1',
        blocks: [{ type: 'text_full', data: { content: 'Hello' } }],
      });
    });
  });

  describe('update', () => {
    it('updates an existing post', async () => {
      const mockPost = { id: 'p1', title: 'Updated', slug: 'updated', status: 'draft' };

      mockChain.single = vi.fn().mockResolvedValue({ data: mockPost, error: null });

      const result = await postService.update('p1', { title: 'Updated' });

      expect(mockedFrom).toHaveBeenCalledWith('posts');
      expect(mockChain.update).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    it('syncs blocks when blocks are provided', async () => {
      const mockPost = { id: 'p1', title: 'Post', slug: 'post', status: 'draft' };

      mockChain.single = vi.fn().mockResolvedValue({ data: mockPost, error: null });
      mockedBlockService.syncBlocks.mockResolvedValue([] as never);

      const blocks = [
        { id: 'b1', type: 'text_full' as const, data: { content: 'Updated' }, sort_order: 0 },
      ];

      await postService.update('p1', { blocks });

      expect(mockedBlockService.syncBlocks).toHaveBeenCalledWith('p1', blocks);
    });

    it('checks for slug uniqueness when slug is updated', async () => {
      // First single() for slug check, second for the actual update
      mockChain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: { id: 'other-post' }, error: null }) // slug exists
        .mockResolvedValueOnce({ data: null, error: null });

      await expect(postService.update('p1', { slug: 'taken-slug' })).rejects.toThrow(
        'Slug already exists'
      );
    });
  });

  describe('delete (soft)', () => {
    it('sets deleted_at instead of removing the post', async () => {
      mockChain.eq = vi.fn().mockResolvedValue({ error: null });

      await postService.delete('p1');

      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(String) })
      );
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'p1');
      expect(mockedStorageService.deleteImages).not.toHaveBeenCalled();
    });

    it('throws when supabase returns an error', async () => {
      mockChain.eq = vi.fn().mockResolvedValue({ error: new Error('DB error') });

      await expect(postService.delete('p1')).rejects.toThrow('DB error');
    });
  });

  describe('generateSlug', () => {
    it('creates a valid slug from an English title', () => {
      expect(postService.generateSlug('Hello World')).toBe('hello-world');
    });

    it('removes special characters', () => {
      expect(postService.generateSlug('Hello, World!')).toBe('hello-world');
    });

    it('strips leading and trailing hyphens', () => {
      expect(postService.generateSlug('--Hello World--')).toBe('hello-world');
    });

    it('transliterates Ukrainian characters', () => {
      expect(postService.generateSlug('Привіт Світ')).toBe('pryvit-svit');
    });

    it('handles mixed Latin and Cyrillic', () => {
      const slug = postService.generateSlug('Design Проект');
      expect(slug).toBe('design-proekt');
    });

    it('collapses multiple consecutive special characters into single hyphen', () => {
      expect(postService.generateSlug('hello   world')).toBe('hello-world');
    });
  });
});
