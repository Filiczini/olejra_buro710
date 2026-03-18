import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock db
const mockReturning = vi.fn();
const mockValues = vi.fn(() => ({ returning: mockReturning }));
const mockInsertFn = vi.fn(() => ({ values: mockValues }));

const mockSelectDistinctFrom = vi.fn();
const mockSelectDistinctOrderBy = vi.fn();
const mockSelectDistinct = vi.fn(() => ({
  from: (...args: unknown[]) => {
    mockSelectDistinctFrom(...args);
    return { orderBy: (...oArgs: unknown[]) => mockSelectDistinctOrderBy(...oArgs) };
  },
}));

const mockSelect = vi.fn();

vi.mock('../../db', () => ({
  db: {
    insert: (...args: unknown[]) => mockInsertFn(...args),
    select: (...args: unknown[]) => mockSelect(...args),
    selectDistinct: (...args: unknown[]) => mockSelectDistinct(...args),
  },
}));

vi.mock('../../db/schema', () => ({
  activityLogs: {
    user_email: 'user_email',
    action: 'action',
    created_at: 'created_at',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  desc: vi.fn((col) => col),
  count: vi.fn(() => 'count_fn'),
  and: vi.fn((...conditions: unknown[]) => ({ op: 'and', conditions })),
}));

import { activityLogService } from '../activityLogService';

// Helper: build a chainable select mock supporting both:
//   from().where().orderBy().limit().offset()
//   from().orderBy().limit().offset()
//   from() -> direct resolve (for count without where)
function buildSelectChain(countValue: number, dataValue: unknown[]) {
  let callCount = 0;

  return (..._args: unknown[]) => {
    callCount++;
    const isCountCall = callCount % 2 === 1;

    if (isCountCall) {
      // Count query
      return {
        from: vi.fn(() => {
          const countResult = [{ count: countValue }];
          return {
            where: vi.fn().mockResolvedValue(countResult),
            // When no where: direct resolve for Drizzle
            then: vi.fn((resolve: any) => resolve(countResult)),
            [Symbol.iterator]: undefined,
          };
        }),
      };
    } else {
      // Data query
      const offset = vi.fn().mockResolvedValue(dataValue);
      const limit = vi.fn(() => ({ offset }));
      const orderBy = vi.fn(() => ({ limit }));
      const where = vi.fn(() => ({ orderBy }));

      return {
        from: vi.fn(() => ({
          where,
          orderBy, // for no-filter path
        })),
      };
    }
  };
}

describe('activityLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        created_at: new Date('2024-01-01'),
      };
      mockReturning.mockResolvedValue([mockLog]);

      const result = await activityLogService.log({
        user_email: 'admin@test.com',
        action: 'create',
        entity_id: 'post-1',
        entity_title: 'Test Post',
      });

      expect(mockValues).toHaveBeenCalledWith({
        user_email: 'admin@test.com',
        action: 'create',
        entity_type: 'post',
        entity_id: 'post-1',
        entity_title: 'Test Post',
        changes: {},
      });
      expect(result.user_email).toBe('admin@test.com');
      expect(result.action).toBe('create');
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
        created_at: new Date('2024-01-01'),
      };
      mockReturning.mockResolvedValue([mockLog]);

      await activityLogService.log({
        user_email: 'admin@test.com',
        action: 'update',
        entity_type: 'project',
        entity_id: 'proj-1',
        entity_title: 'My Project',
        changes,
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          entity_type: 'project',
          changes,
        })
      );
    });

    it('throws on database error', async () => {
      mockReturning.mockRejectedValue(new Error('Insert failed'));

      await expect(
        activityLogService.log({
          user_email: 'admin@test.com',
          action: 'delete',
          entity_id: 'post-1',
          entity_title: 'Deleted Post',
        })
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('getLogs', () => {
    it('returns paginated logs with defaults', async () => {
      const mockLogs = [
        {
          id: '1',
          action: 'create',
          user_email: 'admin@test.com',
          entity_type: 'post',
          entity_id: 'p1',
          entity_title: 'Post',
          changes: {},
          created_at: new Date('2024-01-01'),
        },
      ];

      mockSelect.mockImplementation(buildSelectChain(1, mockLogs));

      const result = await activityLogService.getLogs();

      expect(result.data[0].action).toBe('create');
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('applies page and limit params', async () => {
      mockSelect.mockImplementation(buildSelectChain(50, []));

      const result = await activityLogService.getLogs({ page: 3, limit: 10 });

      expect(result.pagination).toEqual({ page: 3, limit: 10, total: 50, totalPages: 5 });
    });

    it('handles null data and count', async () => {
      mockSelect.mockImplementation(buildSelectChain(0, []));

      const result = await activityLogService.getLogs();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('getUniqueUsers', () => {
    it('returns distinct emails', async () => {
      const emails = [{ user_email: 'a@test.com' }, { user_email: 'b@test.com' }];
      mockSelectDistinctOrderBy.mockResolvedValue(emails);

      const result = await activityLogService.getUniqueUsers();

      expect(result).toEqual(['a@test.com', 'b@test.com']);
    });

    it('returns empty array when no logs', async () => {
      mockSelectDistinctOrderBy.mockResolvedValue([]);

      const result = await activityLogService.getUniqueUsers();

      expect(result).toEqual([]);
    });
  });
});
