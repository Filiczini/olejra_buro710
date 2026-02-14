import { supabase } from '../config/supabase';
import { telegramService } from './telegramService';

interface CreateContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  create: async (data: CreateContactData) => {
    const telegramResult = await telegramService.sendMessage(data);

    const { data: insertedMessage, error } = await supabase
      .from('contact_messages')
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        telegram_sent: telegramResult.success,
        telegram_message_id: telegramResult.messageId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving contact message:', error);
      throw error;
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
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
      supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
    ]);

    return {
      data: dataResult.data || [],
      total: countResult.count || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult.count || 0) / limit),
    };
  },
};
