import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../lib/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const originalEnv = { ...process.env };

describe('telegramService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat-id';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  const messageData = {
    name: 'Іван',
    email: 'ivan@test.com',
    phone: '+380441234567',
    message: 'Тестове повідомлення',
  };

  it('sends message successfully', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true, result: { message_id: 42 } }),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    // Re-import to pick up env vars
    vi.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat-id';
    const { telegramService } = await import('../telegramService');

    const result = await telegramService.sendMessage(messageData);

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('42');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-bot-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const callBody = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(callBody.chat_id).toBe('test-chat-id');
    expect(callBody.text).toContain('Іван');
  });

  it('returns error when credentials not configured', async () => {
    vi.resetModules();
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    const { telegramService } = await import('../telegramService');

    const result = await telegramService.sendMessage(messageData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Telegram not configured');
  });

  it('returns error when API returns not ok', async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({ ok: false, description: 'Bad Request: chat not found' }),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    vi.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat-id';
    const { telegramService } = await import('../telegramService');

    const result = await telegramService.sendMessage(messageData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Bad Request: chat not found');
  });

  it('handles fetch exceptions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    vi.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat-id';
    const { telegramService } = await import('../telegramService');

    const result = await telegramService.sendMessage(messageData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to send Telegram message');
  });

  it('handles API response with ok:true but result.ok:false', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: false, description: 'Unauthorized' }),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    vi.resetModules();
    process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat-id';
    const { telegramService } = await import('../telegramService');

    const result = await telegramService.sendMessage(messageData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });
});
