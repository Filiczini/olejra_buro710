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
  chain.order = vi.fn().mockReturnValue(self());
  chain.range = vi.fn().mockResolvedValue(resolvedValue);
  chain.single = vi.fn().mockResolvedValue(resolvedValue);

  return chain;
};

let mockChain = createChainMock();

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

vi.mock('../telegramService', () => ({
  telegramService: {
    sendMessage: vi.fn(),
  },
}));

vi.mock('../../lib/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { contactService } from '../contactService';
import { telegramService } from '../telegramService';
import { supabase } from '../../config/supabase';

const mockSendMessage = vi.mocked(telegramService.sendMessage);

const contactData = {
  name: 'Іван',
  email: 'ivan@test.com',
  subject: 'Запит',
  message: 'Хочу замовити проєкт',
};

describe('contactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = createChainMock();
    vi.mocked(supabase.from).mockReturnValue(mockChain as never);
  });

  describe('create', () => {
    it('sends telegram and saves message to database', async () => {
      mockSendMessage.mockResolvedValue({ success: true, messageId: '123' });
      const savedMsg = { id: '1', ...contactData, telegram_sent: true, telegram_message_id: '123' };
      mockChain = createChainMock({ data: savedMsg, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await contactService.create(contactData);

      expect(mockSendMessage).toHaveBeenCalledWith(contactData);
      expect(supabase.from).toHaveBeenCalledWith('contact_messages');
      expect(mockChain.insert).toHaveBeenCalledWith({
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        telegram_sent: true,
        telegram_message_id: '123',
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Повідомлення надіслано успішно');
      expect(result.data).toEqual(savedMsg);
    });

    it('saves message even when telegram fails', async () => {
      mockSendMessage.mockResolvedValue({ success: false, error: 'Not configured' });
      const savedMsg = { id: '2', ...contactData, telegram_sent: false, telegram_message_id: null };
      mockChain = createChainMock({ data: savedMsg, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      const result = await contactService.create(contactData);

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          telegram_sent: false,
          telegram_message_id: null,
        })
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('не вдалося відправити в Telegram');
    });

    it('throws when database insert fails', async () => {
      mockSendMessage.mockResolvedValue({ success: true, messageId: '123' });
      const dbError = { message: 'Insert failed' };
      mockChain = createChainMock({ data: null, error: dbError });
      vi.mocked(supabase.from).mockReturnValue(mockChain as never);

      await expect(contactService.create(contactData)).rejects.toEqual(dbError);
    });
  });

  describe('getAll', () => {
    it('returns paginated messages with defaults', async () => {
      const messages = [{ id: '1', name: 'Test' }];

      // Count query: select('*', { count, head }) resolves directly (no .order/.range)
      const countChain = createChainMock();
      countChain.select = vi.fn().mockResolvedValue({ count: 5, error: null });

      // Data query: select → order → range
      const dataChain = createChainMock({ data: messages, error: null });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? countChain : dataChain) as never;
      });

      const result = await contactService.getAll();

      expect(result.data).toEqual(messages);
      expect(result.pagination).toEqual({ total: 5, page: 1, limit: 20, totalPages: 1 });
    });

    it('applies pagination params', async () => {
      const countChain = createChainMock();
      countChain.select = vi.fn().mockResolvedValue({ count: 50, error: null });

      const dataChain = createChainMock({ data: [], error: null });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? countChain : dataChain) as never;
      });

      const result = await contactService.getAll({ page: 3, limit: 10 });

      expect(dataChain.range).toHaveBeenCalledWith(20, 29);
      expect(result.pagination).toEqual({ total: 50, page: 3, limit: 10, totalPages: 5 });
    });

    it('handles empty results', async () => {
      const countChain = createChainMock();
      countChain.select = vi.fn().mockResolvedValue({ count: 0, error: null });

      const dataChain = createChainMock({ data: null, error: null });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? countChain : dataChain) as never;
      });

      const result = await contactService.getAll();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
