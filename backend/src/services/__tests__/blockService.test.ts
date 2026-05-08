import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockReturning,
  mockInsertValues,
  mockInsertFn,
  mockUpdateSet,
  mockUpdateFn,
  mockDeleteWhere,
  mockDeleteFn,
  mockSelectOrderBy,
  mockSelectWhere,
  mockSelectFrom,
  mockSelect,
} = vi.hoisted(() => {
  const mockReturning = vi.fn();
  const mockInsertValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsertFn = vi.fn(() => ({ values: mockInsertValues }));
  const mockUpdateSet = vi.fn(() => ({ where: vi.fn(() => ({ returning: mockReturning })) }));
  const mockUpdateFn = vi.fn(() => ({ set: mockUpdateSet }));
  const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);
  const mockDeleteFn = vi.fn(() => ({ where: mockDeleteWhere }));

  const mockSelectOrderBy = vi.fn();
  const mockSelectWhere = vi.fn(() => ({ orderBy: mockSelectOrderBy }));
  const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
  const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

  return {
    mockReturning,
    mockInsertValues,
    mockInsertFn,
    mockUpdateSet,
    mockUpdateFn,
    mockDeleteWhere,
    mockDeleteFn,
    mockSelectOrderBy,
    mockSelectWhere,
    mockSelectFrom,
    mockSelect,
  };
});

vi.mock('../../db', () => ({
  db: {
    select: mockSelect,
    insert: mockInsertFn,
    update: mockUpdateFn,
    delete: mockDeleteFn,
  },
}));

vi.mock('../../db/schema', () => ({
  blocks: {
    id: 'id',
    post_id: 'post_id',
    sort_order: 'sort_order',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  asc: vi.fn((col) => col),
}));

import { blockService } from '../blockService';

describe('blockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
          created_at: new Date('2024-01-01'),
        },
        {
          id: 'b2',
          post_id: 'p1',
          type: 'image_full',
          data: { image_url: 'x.jpg' },
          sort_order: 1,
          created_at: new Date('2024-01-01'),
        },
      ];

      mockSelectOrderBy.mockResolvedValue(mockBlocks);

      const result = await blockService.getByPostId('p1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('b1');
      expect(result[0].created_at).toBe('2024-01-01T00:00:00.000Z');
    });

    it('returns empty array when no blocks exist', async () => {
      mockSelectOrderBy.mockResolvedValue([]);

      const result = await blockService.getByPostId('p1');

      expect(result).toEqual([]);
    });

    it('throws when database returns an error', async () => {
      mockSelectOrderBy.mockRejectedValue(new Error('DB error'));

      await expect(blockService.getByPostId('p1')).rejects.toThrow('DB error');
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
          created_at: new Date('2024-01-01'),
        },
      ];

      mockReturning.mockResolvedValue(mockCreated);

      const result = await blockService.create({
        postId: 'p1',
        blocks: [{ type: 'text_full', data: { content: 'Hello' } }],
      });

      expect(mockInsertValues).toHaveBeenCalledWith([
        { post_id: 'p1', type: 'text_full', data: { content: 'Hello' }, sort_order: 0 },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b1');
    });

    it('uses provided sort_order when specified', async () => {
      mockReturning.mockResolvedValue([]);

      await blockService.create({
        postId: 'p1',
        blocks: [{ type: 'text_full', data: { content: 'Hello' }, sort_order: 5 }],
      });

      expect(mockInsertValues).toHaveBeenCalledWith([
        { post_id: 'p1', type: 'text_full', data: { content: 'Hello' }, sort_order: 5 },
      ]);
    });

    it('throws when database returns an error', async () => {
      mockReturning.mockRejectedValue(new Error('Insert failed'));

      await expect(
        blockService.create({
          postId: 'p1',
          blocks: [{ type: 'text_full', data: { content: 'x' } }],
        })
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('delete', () => {
    it('removes a block by id', async () => {
      mockDeleteWhere.mockResolvedValue(undefined);

      await blockService.delete('b1');

      expect(mockDeleteFn).toHaveBeenCalled();
      expect(mockDeleteWhere).toHaveBeenCalled();
    });

    it('throws when database returns an error', async () => {
      mockDeleteWhere.mockRejectedValue(new Error('Delete failed'));

      await expect(blockService.delete('b1')).rejects.toThrow('Delete failed');
    });
  });

  describe('deleteByPostId', () => {
    it('removes all blocks for a post', async () => {
      mockDeleteWhere.mockResolvedValue(undefined);

      await blockService.deleteByPostId('p1');

      expect(mockDeleteFn).toHaveBeenCalled();
    });

    it('throws when database returns an error', async () => {
      mockDeleteWhere.mockRejectedValue(new Error('Delete failed'));

      await expect(blockService.deleteByPostId('p1')).rejects.toThrow('Delete failed');
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
          created_at: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'b2',
          post_id: 'p1',
          type: 'image_full',
          data: { image_url: 'x.jpg' },
          sort_order: 1,
          created_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      const getByPostIdSpy = vi.spyOn(blockService, 'getByPostId');
      const deleteSpy = vi.spyOn(blockService, 'delete');
      const createSpy = vi.spyOn(blockService, 'create');
      const updateSpy = vi.spyOn(blockService, 'update');

      getByPostIdSpy.mockResolvedValueOnce(existingBlocks as never);

      deleteSpy.mockResolvedValue(undefined);
      createSpy.mockResolvedValue([
        {
          id: 'b3',
          post_id: 'p1',
          type: 'text_full',
          data: { content: 'New' },
          sort_order: 2,
          created_at: '2024-01-01T00:00:00.000Z',
        },
      ] as never);
      updateSpy.mockResolvedValue({
        id: 'b1',
        post_id: 'p1',
        type: 'text_full',
        data: { content: 'Updated' },
        sort_order: 0,
        created_at: '2024-01-01T00:00:00.000Z',
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
