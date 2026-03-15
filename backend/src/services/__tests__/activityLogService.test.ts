import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  chain.eq = vi.fn().mockReturnValue(self());
  chain.order = vi.fn().mockReturnValue(self());
  chain.range = vi.fn().mockResolvedValue(resolvedValue);
  chain.single = vi.fn().mockResolvedValue(resolvedValue);

  return chain;
};

let mockChain = createChainMock();
const mockRpc = vi.fn();

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import { activityLogService } from '../activityLogService';
import { supabase } from '../../config/supabase';

describe('activityLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = createChainMock();
    vi.mocked(supabase.from).mockReturnValue(mockChain as never);
  });

  describe('log', () => {
    it('inserts an activity log entry', async () => {
      const mockLog = {
        id: '1',
        user_email: 'admin@test.com',
        action: 'create',
        entity_type: 'post',
        entity_id: 'post-1',
        entity_title: 'Test Post',
        changes: {},
      };
      mockChain = createChainMock({ data: mockLog, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await activityLogService.log({
        user_email: 'admin@test.com',
        action: 'create',
        entity_id: 'post-1',
        entity_title: 'Test Post',
      });

      expect(supabase.from).toHaveBeenCalledWith('activity_logs');
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_email: 'admin@test.com',
        action: 'create',
        entity_type: 'post',
        entity_id: 'post-1',
        entity_title: 'Test Post',
        changes: {},
      });
      expect(result).toEqual(mockLog);
    });

    it('uses provided entity_type and changes', async () => {
      const changes = { fields: ['title', 'slug'] };
      const mockLog = {
        id: '2',
        user_email: 'admin@test.com',
        action: 'update',
        entity_type: 'project',
        entity_id: 'proj-1',
        entity_title: 'My Project',
        changes,
      };
      mockChain = createChainMock({ data: mockLog, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await activityLogService.log({
        user_email: 'admin@test.com',
        action: 'update',
        entity_type: 'project',
        entity_id: 'proj-1',
        entity_title: 'My Project',
        changes,
      });

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          entity_type: 'project',
          changes,
        })
      );
    });

    it('throws on database error', async () => {
      const dbError = { message: 'Insert failed' };
      mockChain = createChainMock({ data: null, error: dbError });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await expect(
        activityLogService.log({
          user_email: 'admin@test.com',
          action: 'delete',
          entity_id: 'post-1',
          entity_title: 'Deleted Post',
        })
      ).rejects.toEqual(dbError);
    });
  });

  describe('getLogs', () => {
    it('returns paginated logs with defaults', async () => {
      const mockLogs = [{ id: '1', action: 'create' }];
      mockChain = createChainMock({ data: mockLogs, error: null, count: 1 });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await activityLogService.getLogs();

      expect(mockChain.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockChain.range).toHaveBeenCalledWith(0, 19);
      expect(result.data).toEqual(mockLogs);
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('applies page and limit params', async () => {
      mockChain = createChainMock({ data: [], error: null, count: 50 });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await activityLogService.getLogs({ page: 3, limit: 10 });

      expect(mockChain.range).toHaveBeenCalledWith(20, 29);
      expect(result.pagination).toEqual({ page: 3, limit: 10, total: 50, totalPages: 5 });
    });

    it('filters by user_email', async () => {
      mockChain = createChainMock({ data: [], error: null, count: 0 });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await activityLogService.getLogs({ user_email: 'admin@test.com' });

      expect(mockChain.eq).toHaveBeenCalledWith('user_email', 'admin@test.com');
    });

    it('filters by action', async () => {
      mockChain = createChainMock({ data: [], error: null, count: 0 });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await activityLogService.getLogs({ action: 'delete' });

      expect(mockChain.eq).toHaveBeenCalledWith('action', 'delete');
    });

    it('throws on database error', async () => {
      mockChain = createChainMock({ data: null, error: { message: 'Query failed' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await expect(activityLogService.getLogs()).rejects.toEqual({ message: 'Query failed' });
    });

    it('handles null data and count', async () => {
      mockChain = createChainMock({ data: null, error: null, count: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await activityLogService.getLogs();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('getUniqueUsers', () => {
    it('returns emails from RPC call', async () => {
      const emails = [{ user_email: 'a@test.com' }, { user_email: 'b@test.com' }];
      mockRpc.mockResolvedValue({ data: emails, error: null });

      const result = await activityLogService.getUniqueUsers();

      expect(mockRpc).toHaveBeenCalledWith('get_unique_user_emails');
      expect(result).toEqual(['a@test.com', 'b@test.com']);
    });

    it('returns empty array when RPC returns no data', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      const result = await activityLogService.getUniqueUsers();

      expect(result).toEqual([]);
    });

    it('falls back to manual deduplication when RPC fails', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC not found' } });

      const fallbackData = [
        { user_email: 'a@test.com' },
        { user_email: 'b@test.com' },
        { user_email: 'a@test.com' },
      ];
      mockChain = createChainMock();
      mockChain.order = vi.fn().mockResolvedValue({ data: fallbackData, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await activityLogService.getUniqueUsers();

      expect(supabase.from).toHaveBeenCalledWith('activity_logs');
      expect(mockChain.select).toHaveBeenCalledWith('user_email');
      expect(result).toEqual(['a@test.com', 'b@test.com']);
    });

    it('throws when both RPC and fallback fail', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC not found' } });

      mockChain = createChainMock();
      mockChain.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await expect(activityLogService.getUniqueUsers()).rejects.toEqual({ message: 'DB error' });
    });
  });
});
