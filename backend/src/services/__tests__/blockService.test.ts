import { describe, it, expect, vi, beforeEach } from 'vitest';

// Build a chainable mock for the Supabase query builder
const createChainMock = (
  resolvedValue: { data?: unknown; error?: unknown } = { data: null, error: null }
) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = () => chain;

  chain.select = vi.fn().mockReturnValue(self());
  chain.insert = vi.fn().mockReturnValue(self());
  chain.update = vi.fn().mockReturnValue(self());
  chain.delete = vi.fn().mockReturnValue(self());
  chain.eq = vi.fn().mockReturnValue(self());
  chain.order = vi.fn().mockReturnValue(self());
  chain.single = vi.fn().mockResolvedValue(resolvedValue);

  // Make the chain itself thenable for queries that don't end with .single()
  chain.then = vi.fn((resolve: (val: unknown) => void) => resolve(resolvedValue));

  return chain;
};

let mockChain = createChainMock();

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

import { blockService } from '../blockService';
import { supabase } from '../../config/supabase';

const mockedFrom = vi.mocked(supabase.from);

describe('blockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = createChainMock();
    mockedFrom.mockReturnValue(mockChain as never);
  });

  describe('getByPostId', () => {
    it('returns blocks ordered by sort_order', async () => {
      const mockBlocks = [
        {
          id: 'b1',
          post_id: 'p1',
          type: 'text_full',
          data: { content: 'A' },
          sort_order: 0,
          created_at: '2024-01-01',
        },
        {
          id: 'b2',
          post_id: 'p1',
          type: 'image_full',
          data: { image_url: 'x.jpg' },
          sort_order: 1,
          created_at: '2024-01-01',
        },
      ];

      // Override order to resolve with data
      mockChain.order = vi.fn().mockResolvedValue({ data: mockBlocks, error: null });

      const result = await blockService.getByPostId('p1');

      expect(mockedFrom).toHaveBeenCalledWith('blocks');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('post_id', 'p1');
      expect(mockChain.order).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(result).toEqual(mockBlocks);
    });

    it('returns empty array when no blocks exist', async () => {
      mockChain.order = vi.fn().mockResolvedValue({ data: null, error: null });

      const result = await blockService.getByPostId('p1');

      expect(result).toEqual([]);
    });

    it('throws when supabase returns an error', async () => {
      mockChain.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });

      await expect(blockService.getByPostId('p1')).rejects.toEqual({ message: 'DB error' });
    });
  });

  describe('create', () => {
    it('inserts blocks with post_id and sort_order', async () => {
      const mockCreated = [
        {
          id: 'b1',
          post_id: 'p1',
          type: 'text_full',
          data: { content: 'Hello' },
          sort_order: 0,
          created_at: '2024-01-01',
        },
      ];

      mockChain.select = vi.fn().mockResolvedValue({ data: mockCreated, error: null });

      const result = await blockService.create({
        postId: 'p1',
        blocks: [{ type: 'text_full', data: { content: 'Hello' } }],
      });

      expect(mockedFrom).toHaveBeenCalledWith('blocks');
      expect(mockChain.insert).toHaveBeenCalledWith([
        { post_id: 'p1', type: 'text_full', data: { content: 'Hello' }, sort_order: 0 },
      ]);
      expect(result).toEqual(mockCreated);
    });

    it('uses provided sort_order when specified', async () => {
      mockChain.select = vi.fn().mockResolvedValue({ data: [], error: null });

      await blockService.create({
        postId: 'p1',
        blocks: [{ type: 'text_full', data: { content: 'Hello' }, sort_order: 5 }],
      });

      expect(mockChain.insert).toHaveBeenCalledWith([
        { post_id: 'p1', type: 'text_full', data: { content: 'Hello' }, sort_order: 5 },
      ]);
    });

    it('throws when supabase returns an error', async () => {
      mockChain.select = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      await expect(
        blockService.create({
          postId: 'p1',
          blocks: [{ type: 'text_full', data: { content: 'x' } }],
        })
      ).rejects.toEqual({ message: 'Insert failed' });
    });
  });

  describe('delete', () => {
    it('removes a block by id', async () => {
      mockChain.eq = vi.fn().mockResolvedValue({ error: null });

      await blockService.delete('b1');

      expect(mockedFrom).toHaveBeenCalledWith('blocks');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'b1');
    });

    it('throws when supabase returns an error', async () => {
      mockChain.eq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } });

      await expect(blockService.delete('b1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });

  describe('deleteByPostId', () => {
    it('removes all blocks for a post', async () => {
      mockChain.eq = vi.fn().mockResolvedValue({ error: null });

      await blockService.deleteByPostId('p1');

      expect(mockedFrom).toHaveBeenCalledWith('blocks');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('post_id', 'p1');
    });

    it('throws when supabase returns an error', async () => {
      mockChain.eq = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } });

      await expect(blockService.deleteByPostId('p1')).rejects.toEqual({ message: 'Delete failed' });
    });
  });

  describe('syncBlocks', () => {
    it('creates new blocks, updates existing, and deletes removed', async () => {
      const existingBlocks = [
        {
          id: 'b1',
          post_id: 'p1',
          type: 'text_full',
          data: { content: 'Old' },
          sort_order: 0,
          created_at: '2024-01-01',
        },
        {
          id: 'b2',
          post_id: 'p1',
          type: 'image_full',
          data: { image_url: 'x.jpg' },
          sort_order: 1,
          created_at: '2024-01-01',
        },
      ];

      // We need to spy on the service methods since syncBlocks calls them internally
      const getByPostIdSpy = vi.spyOn(blockService, 'getByPostId');
      const deleteSpy = vi.spyOn(blockService, 'delete');
      const createSpy = vi.spyOn(blockService, 'create');
      const updateSpy = vi.spyOn(blockService, 'update');

      // First call: get existing blocks (no second call — syncBlocks returns combined results)
      getByPostIdSpy.mockResolvedValueOnce(existingBlocks as never);

      deleteSpy.mockResolvedValue(undefined);
      createSpy.mockResolvedValue([
        {
          id: 'b3',
          post_id: 'p1',
          type: 'text_full',
          data: { content: 'New' },
          sort_order: 2,
          created_at: '2024-01-01',
        },
      ] as never);
      updateSpy.mockResolvedValue({
        id: 'b1',
        post_id: 'p1',
        type: 'text_full',
        data: { content: 'Updated' },
        sort_order: 0,
        created_at: '2024-01-01',
      } as never);

      const incomingBlocks = [
        { id: 'b1', type: 'text_full' as const, data: { content: 'Updated' }, sort_order: 0 },
        { type: 'text_full' as const, data: { content: 'New' }, sort_order: 2 },
      ];

      const result = await blockService.syncBlocks('p1', incomingBlocks);

      // b2 should be deleted (exists but not in incoming)
      expect(deleteSpy).toHaveBeenCalledWith('b2');

      // New block should be created (no id)
      expect(createSpy).toHaveBeenCalledWith({
        postId: 'p1',
        blocks: [{ type: 'text_full', data: { content: 'New' }, sort_order: 2 }],
      });

      // b1 should be updated (has id and exists)
      expect(updateSpy).toHaveBeenCalledWith('b1', {
        type: 'text_full',
        data: { content: 'Updated' },
        sort_order: 0,
      });

      expect(result).toHaveLength(2);

      getByPostIdSpy.mockRestore();
      deleteSpy.mockRestore();
      createSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });
});
