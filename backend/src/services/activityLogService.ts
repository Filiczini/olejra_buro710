import { supabase } from '../config/supabase';
import type { ActivityLog, ActivityChanges, ActivityLogsParams } from '../types/activityLog';

interface LogParams {
  user_email: string;
  action: 'create' | 'update' | 'delete';
  entity_type?: string;
  entity_id: string;
  entity_title: string;
  changes?: ActivityChanges;
}

export const activityLogService = {
  log: async (params: LogParams): Promise<ActivityLog> => {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_email: params.user_email,
        action: params.action,
        entity_type: params.entity_type || 'post',
        entity_id: params.entity_id,
        entity_title: params.entity_title,
        changes: params.changes || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data as ActivityLog;
  },

  getLogs: async (params?: ActivityLogsParams) => {
    const { page = 1, limit = 20, user_email, action } = params || {};

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (user_email) {
      query = query.eq('user_email', user_email);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  getUniqueUsers: async (): Promise<string[]> => {
    const { data, error } = await supabase.rpc('get_unique_user_emails');

    if (error) {
      // Fallback if RPC not available: fetch with deduplication
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('activity_logs')
        .select('user_email')
        .order('user_email', { ascending: true });

      if (fallbackError) throw fallbackError;

      return [...new Set(fallbackData?.map((log: { user_email: string }) => log.user_email))];
    }

    return data?.map((row: { user_email: string }) => row.user_email) || [];
  },
};
