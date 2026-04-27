import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

const mockInsert = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockDelete = vi.fn();

vi.mock('../../db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: mockInsert,
    })),
    select: vi.fn(() => ({
      from: mockFrom,
    })),
    delete: vi.fn(() => ({
      where: mockDelete,
    })),
  },
}));

vi.mock('../../db/schema', () => ({
  refreshTokens: {
    id: 'id',
    user_id: 'user_id',
    token_hash: 'token_hash',
    expires_at: 'expires_at',
    created_at: 'created_at',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  and: vi.fn((...conds) => ({ op: 'and', conds })),
  gt: vi.fn((col, val) => ({ col, val, op: 'gt' })),
}));

import { refreshTokenService } from '../refreshTokenService';

describe('refreshTokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates a refresh token and returns the plain token', async () => {
      mockInsert.mockResolvedValue(undefined);

      const result = await refreshTokenService.create('user-123');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64); // 32 bytes hex = 64 chars
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          token_hash: expect.any(String),
          expires_at: expect.any(Date),
        })
      );
    });
  });

  describe('verify', () => {
    it('returns true when token exists and is not expired', async () => {
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockResolvedValue([{ id: 'token-id' }]);

      const plainToken = crypto.randomBytes(32).toString('hex');
      const result = await refreshTokenService.verify('user-123', plainToken);

      expect(result).toBe(true);
    });

    it('returns false when token is not found', async () => {
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockResolvedValue([]);

      const result = await refreshTokenService.verify('user-123', 'invalid-token');

      expect(result).toBe(false);
    });

    it('returns false when token is expired', async () => {
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockResolvedValue([]);

      const result = await refreshTokenService.verify('user-123', 'expired-token');

      expect(result).toBe(false);
    });
  });

  describe('rotate', () => {
    it('deletes old token and creates a new one', async () => {
      mockDelete.mockResolvedValue(undefined);
      mockInsert.mockResolvedValue(undefined);

      const oldToken = crypto.randomBytes(32).toString('hex');
      const newToken = await refreshTokenService.rotate('user-123', oldToken);

      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(oldToken);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('revokeAllForUser', () => {
    it('deletes all refresh tokens for a user', async () => {
      mockDelete.mockResolvedValue(undefined);

      await refreshTokenService.revokeAllForUser('user-123');

      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
