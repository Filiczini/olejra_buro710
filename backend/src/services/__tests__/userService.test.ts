import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockOrderBy,
  mockInsertValues,
  mockInsertReturning,
  mockUpdateSet,
  mockUpdateWhere,
  mockDeleteWhere,
} = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockOrderBy = vi.fn();
  const mockFrom = vi.fn(() => ({
    where: (...wArgs: unknown[]) => mockWhere(...wArgs),
    orderBy: (...oArgs: unknown[]) => mockOrderBy(...oArgs),
  }));
  const mockSelect = vi.fn(() => ({ from: (...fArgs: unknown[]) => (mockFrom as any)(...fArgs) }));

  const mockInsertReturning = vi.fn();
  const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));

  const mockUpdateWhere = vi.fn();
  const mockUpdateSet = vi.fn(() => ({
    where: (...wArgs: unknown[]) => mockUpdateWhere(...wArgs),
  }));

  const mockDeleteWhere = vi.fn();

  return {
    mockSelect,
    mockFrom,
    mockWhere,
    mockOrderBy,
    mockInsertValues,
    mockInsertReturning,
    mockUpdateSet,
    mockUpdateWhere,
    mockDeleteWhere,
  };
});

vi.mock('../../db', () => ({
  db: {
    select: (...args: any[]) => {
      (mockSelect as any)(...args);
      return {
        from: (...fArgs: unknown[]) => {
          (mockFrom as any)(...fArgs);
          return {
            where: (...wArgs: unknown[]) => (mockWhere as any)(...wArgs),
            orderBy: (...oArgs: unknown[]) => (mockOrderBy as any)(...oArgs),
          };
        },
      };
    },
    insert: () => ({ values: mockInsertValues }),
    update: () => ({ set: mockUpdateSet }),
    delete: () => ({ where: mockDeleteWhere }),
  },
}));

vi.mock('../../db/schema', () => ({
  users: {
    id: 'id',
    email: 'email',
    password_hash: 'password_hash',
    role: 'role',
    created_at: 'created_at',
    token_version: 'token_version',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  sql: vi.fn((template) => template),
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

  describe('getTokenVersion', () => {
    it('returns token_version when user exists', async () => {
      mockWhere.mockResolvedValue([{ token_version: 5 }]);

      const result = await userService.getTokenVersion('user-123');

      expect(result).toBe(5);
    });

    it('returns -1 when user not found', async () => {
      mockWhere.mockResolvedValue([]);

      const result = await userService.getTokenVersion('missing');

      expect(result).toBe(-1);
    });

    it('throws on database error', async () => {
      mockWhere.mockRejectedValue(new Error('DB error'));

      await expect(userService.getTokenVersion('user-123')).rejects.toThrow('DB error');
    });
  });

  describe('incrementTokenVersion', () => {
    it('updates token_version for user', async () => {
      mockUpdateWhere.mockResolvedValue(undefined);

      await userService.incrementTokenVersion('user-123');

      expect(mockUpdateSet).toHaveBeenCalled();
      expect(mockUpdateWhere).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      mockUpdateWhere.mockRejectedValue(new Error('Update failed'));

      await expect(userService.incrementTokenVersion('user-123')).rejects.toThrow('Update failed');
    });
  });

  describe('findAll', () => {
    it('returns all users without password_hash', async () => {
      mockOrderBy.mockResolvedValue([
        {
          id: '1',
          email: 'a@test.com',
          role: 'admin',
          created_at: new Date('2024-01-01'),
        },
        {
          id: '2',
          email: 'b@test.com',
          role: 'user',
          created_at: new Date('2024-01-02'),
        },
      ]);

      const result = await userService.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password_hash');
      expect(result[0].email).toBe('a@test.com');
    });

    it('throws on database error', async () => {
      mockOrderBy.mockRejectedValue(new Error('DB error'));

      await expect(userService.findAll()).rejects.toThrow('DB error');
    });
  });

  describe('create', () => {
    it('creates a user and returns without password_hash', async () => {
      mockInsertReturning.mockResolvedValue([
        {
          id: 'new-id',
          email: 'new@test.com',
          role: 'user',
          created_at: new Date('2024-01-01'),
        },
      ]);

      const result = await userService.create('new@test.com', 'hashed-pass', 'user');

      expect(mockInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@test.com',
          password_hash: 'hashed-pass',
          role: 'user',
        })
      );
      expect(result).toEqual({
        id: 'new-id',
        email: 'new@test.com',
        role: 'user',
        created_at: '2024-01-01T00:00:00.000Z',
      });
    });

    it('throws on database error', async () => {
      mockInsertReturning.mockRejectedValue(new Error('Insert failed'));

      await expect(userService.create('x', 'y', 'z')).rejects.toThrow('Insert failed');
    });
  });

  describe('delete', () => {
    it('deletes user by id', async () => {
      mockDeleteWhere.mockResolvedValue(undefined);

      await userService.delete('user-123');

      expect(mockDeleteWhere).toHaveBeenCalled();
    });

    it('throws on database error', async () => {
      mockDeleteWhere.mockRejectedValue(new Error('Delete failed'));

      await expect(userService.delete('user-123')).rejects.toThrow('Delete failed');
    });
  });

  describe('updatePassword', () => {
    it('updates password and increments token_version', async () => {
      mockUpdateWhere.mockResolvedValue(undefined);

      await userService.updatePassword('user-123', 'new-hash');

      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: 'new-hash',
        })
      );
    });

    it('throws on database error', async () => {
      mockUpdateWhere.mockRejectedValue(new Error('Update failed'));

      await expect(userService.updatePassword('user-123', 'hash')).rejects.toThrow('Update failed');
    });
  });
});
