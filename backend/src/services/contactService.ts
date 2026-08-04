import { desc, count } from 'drizzle-orm';
import { db } from '../db';
import { contactMessages } from '../db/schema';
import { telegramService } from './telegramService';
import { logger } from '../lib/logger.js';

interface CreateContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const contactService = {
  create: async (data: CreateContactData) => {
    const telegramResult = await telegramService.sendMessage(data);

    const [insertedMessage] = await db
      .insert(contactMessages)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        telegram_sent: telegramResult.success,
        telegram_message_id: telegramResult.messageId || null,
      })
      .returning();

    if (!insertedMessage) {
      const err = new Error('Failed to insert contact message');
      logger.error('Error saving contact message', err);
      throw err;
    }

    return {
      success: true,
      message: telegramResult.success
        ? 'Повідомлення надіслано успішно'
        : 'Повідомлення збережено, але не вдалося відправити в Telegram',
      data: insertedMessage,
    };
  },

  getAll: async (params?: { page?: number; limit?: number }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      db.select({ count: count() }).from(contactMessages),
      db
        .select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.created_at))
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.count || 0;
    return {
      data: dataResult,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
