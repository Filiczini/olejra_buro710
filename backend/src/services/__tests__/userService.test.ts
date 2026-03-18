import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();

vi.mock('../../db', () => ({
  db: {
    select: (...args: any[]) => {
      mockSelect(...args);
      return {
        from: (...fArgs: unknown[]) => {
          mockFrom(...fArgs);
          return { where: (...wArgs: unknown[]) => mockWhere(...wArgs) };
        },
      };
    },
  },
}));

vi.mock('../../db/schema', () => ({
  users: {
    id: 'id',
    email: 'email',
    password_hash: 'password_hash',
    role: 'role',
    created_at: 'created_at',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
}));

import { userService } from '../userService';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        password_hash: 'hash',
        role: 'admin',
        created_at: new Date('2024-01-01'),
      };
      mockWhere.mockResolvedValue([mockUser]);

      const result = await userService.findByEmail('admin@test.com');

      expect(result).toEqual({
        id: '1',
        email: 'admin@test.com',
        password_hash: 'hash',
        role: 'admin',
        created_at: '2024-01-01T00:00:00.000Z',
      });
    });

    it('returns null when user not found', async () => {
      mockWhere.mockResolvedValue([]);

      const result = await userService.findByEmail('missing@test.com');

      expect(result).toBeNull();
    });

    it('throws on unexpected errors', async () => {
      mockWhere.mockRejectedValue(new Error('Connection failed'));

      await expect(userService.findByEmail('test@test.com')).rejects.toThrow('Connection failed');
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const mockUser = {
        id: 'abc-123',
        email: 'user@test.com',
        password_hash: 'hash',
        role: 'admin',
        created_at: new Date('2024-01-01'),
      };
      mockWhere.mockResolvedValue([mockUser]);

      const result = await userService.findById('abc-123');

      expect(result).toEqual({
        id: 'abc-123',
        email: 'user@test.com',
        password_hash: 'hash',
        role: 'admin',
        created_at: '2024-01-01T00:00:00.000Z',
      });
    });

    it('returns null when user not found', async () => {
      mockWhere.mockResolvedValue([]);

      const result = await userService.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('throws on unexpected errors', async () => {
      mockWhere.mockRejectedValue(new Error('Internal error'));

      await expect(userService.findById('test')).rejects.toThrow('Internal error');
    });
  });
});
