import { describe, it, expect, vi, beforeEach } from 'vitest';

const createChainMock = (
  resolvedValue: { data?: unknown; error?: unknown } = { data: null, error: null }
) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const self = () => chain;

  chain.select = vi.fn().mockReturnValue(self());
  chain.eq = vi.fn().mockReturnValue(self());
  chain.single = vi.fn().mockResolvedValue(resolvedValue);

  return chain;
};

let mockChain = createChainMock();

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

import { userService } from '../userService';
import { supabase } from '../../config/supabase';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = createChainMock();
    vi.mocked(supabase.from).mockReturnValue(mockChain as never);
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      const mockUser = { id: '1', email: 'admin@test.com', role: 'admin' };
      mockChain = createChainMock({ data: mockUser, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await userService.findByEmail('admin@test.com');

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('email', 'admin@test.com');
      expect(result).toEqual(mockUser);
    });

    it('returns null when user not found (PGRST116)', async () => {
      mockChain = createChainMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await userService.findByEmail('missing@test.com');

      expect(result).toBeNull();
    });

    it('throws on unexpected errors', async () => {
      const dbError = { code: 'PGRST001', message: 'Connection failed' };
      mockChain = createChainMock({ data: null, error: dbError });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await expect(userService.findByEmail('test@test.com')).rejects.toEqual(dbError);
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const mockUser = { id: 'abc-123', email: 'user@test.com', role: 'admin' };
      mockChain = createChainMock({ data: mockUser, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await userService.findById('abc-123');

      expect(mockChain.eq).toHaveBeenCalledWith('id', 'abc-123');
      expect(result).toEqual(mockUser);
    });

    it('returns null when user not found (PGRST116)', async () => {
      mockChain = createChainMock({ data: null, error: { code: 'PGRST116' } });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await userService.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('throws on unexpected errors', async () => {
      const dbError = { code: 'PGRST500', message: 'Internal error' };
      mockChain = createChainMock({ data: null, error: dbError });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await expect(userService.findById('test')).rejects.toEqual(dbError);
    });
  });
});
