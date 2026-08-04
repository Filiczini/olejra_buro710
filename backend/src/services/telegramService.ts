const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

import { logger } from '../lib/logger.js';

interface TelegramMessage {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface TelegramApiResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
}

function formatMessage(data: TelegramMessage): string {
  const date = new Date().toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `📬 *Нове повідомлення з Buro 710*

👤 *Ім'я:* ${escapeMarkdown(data.name)}
📧 *Email:* ${escapeMarkdown(data.email)}
📞 *Телефон:* ${escapeMarkdown(data.phone)}

💬 *Повідомлення:*
${escapeMarkdown(data.message)}

🕐 _${date}_`;
}

function escapeMarkdown(text: string): string {
  const specialChars = /[_*[\[\]]()`~>#+\-=|{}.!\\]/g;
  return text.replace(specialChars, '\\$&');
}

export const telegramService = {
  sendMessage: async (
    data: TelegramMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      logger.warn('Telegram credentials not configured');
      return { success: false, error: 'Telegram not configured' };
    }

    try {
      const text = formatMessage(data);
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
        }),
      });

      const result = (await response.json()) as TelegramApiResponse;

      if (!response.ok || !result.ok) {
        logger.error('Telegram API error', result.description);
        return { success: false, error: result.description || 'Telegram API error' };
      }

      return { success: true, messageId: result.result?.message_id?.toString() };
    } catch (error) {
      logger.error('Telegram send error', error);
      return { success: false, error: 'Failed to send Telegram message' };
    }
  },
};
