import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockReturning, mockValues, mockInsert, mockSelect } = vi.hoisted(() => {
  const mockReturning = vi.fn();
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));

  const mockSelectFrom = vi.fn();
  const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

  return {
    mockReturning,
    mockValues,
    mockInsert,
    mockSelect,
  };
});

vi.mock('../../db', () => ({
  db: {
    insert: mockInsert,
    select: mockSelect,
  },
}));

vi.mock('../../db/schema', () => ({
  contactMessages: { created_at: 'created_at' },
}));

vi.mock('drizzle-orm', () => ({
  desc: vi.fn((col) => col),
  count: vi.fn(() => 'count_fn'),
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
  });

  describe('create', () => {
    it('sends telegram and saves message to database', async () => {
      mockSendMessage.mockResolvedValue({ success: true, messageId: '123' });
      const savedMsg = { id: '1', ...contactData, telegram_sent: true, telegram_message_id: '123' };
      mockReturning.mockResolvedValue([savedMsg]);

      const result = await contactService.create(contactData);

      expect(mockSendMessage).toHaveBeenCalledWith(contactData);
      expect(mockValues).toHaveBeenCalledWith({
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
      mockReturning.mockResolvedValue([savedMsg]);

      const result = await contactService.create(contactData);

      expect(mockValues).toHaveBeenCalledWith(
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
      mockReturning.mockResolvedValue([]);

      await expect(contactService.create(contactData)).rejects.toThrow(
        'Failed to insert contact message'
      );
    });
  });

  describe('getAll', () => {
    it('returns paginated messages with defaults', async () => {
      const messages = [{ id: '1', name: 'Test' }];

      // count query
      const countFrom = vi.fn().mockResolvedValue([{ count: 5 }]);
      // data query
      const dataOrderBy = vi.fn(() => ({
        limit: vi.fn(() => ({ offset: vi.fn().mockResolvedValue(messages) })),
      }));
      const dataFrom = vi.fn(() => ({ orderBy: dataOrderBy }));

      let callCount = 0;
      mockSelect.mockImplementation((..._args: any[]) => {
        callCount++;
        return { from: callCount === 1 ? countFrom : dataFrom } as any;
      });

      const result = await contactService.getAll();

      expect(result.data).toEqual(messages);
      expect(result.pagination).toEqual({ total: 5, page: 1, limit: 20, totalPages: 1 });
    });

    it('applies pagination params', async () => {
      const mockOffsetFn = vi.fn().mockResolvedValue([]);
      const mockLimitFn = vi.fn(() => ({ offset: mockOffsetFn }));
      const dataOrderBy = vi.fn(() => ({ limit: mockLimitFn }));
      const dataFrom = vi.fn(() => ({ orderBy: dataOrderBy }));
      const countFrom = vi.fn().mockResolvedValue([{ count: 50 }]);

      let callCount = 0;
      mockSelect.mockImplementation(() => {
        callCount++;
        return { from: callCount === 1 ? countFrom : dataFrom } as any;
      });

      const result = await contactService.getAll({ page: 3, limit: 10 });

      expect(mockLimitFn).toHaveBeenCalledWith(10);
      expect(mockOffsetFn).toHaveBeenCalledWith(20);
      expect(result.pagination).toEqual({ total: 50, page: 3, limit: 10, totalPages: 5 });
    });

    it('handles empty results', async () => {
      const countFrom = vi.fn().mockResolvedValue([{ count: 0 }]);
      const dataFrom = vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({ offset: vi.fn().mockResolvedValue([]) })),
        })),
      }));

      let callCount = 0;
      mockSelect.mockImplementation(() => {
        callCount++;
        return { from: callCount === 1 ? countFrom : dataFrom } as any;
      });

      const result = await contactService.getAll();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
