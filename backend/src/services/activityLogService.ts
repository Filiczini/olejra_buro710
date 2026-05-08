import { eq, desc, count, and } from 'drizzle-orm';
import { db } from '../db';
import { activityLogs } from '../db/schema';
import type { ActivityLog, ActivityChanges, ActivityLogsParams } from '@buro710/shared';

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
    const [data] = await db
      .insert(activityLogs)
      .values({
        user_email: params.user_email,
        action: params.action,
        entity_type: params.entity_type || 'post',
        entity_id: params.entity_id,
        entity_title: params.entity_title,
        changes: (params.changes || {}) as Record<string, unknown>,
      })
      .returning();

    if (!data) throw new Error('Failed to insert activity log');

    return {
      ...data,
      action: data.action as ActivityLog['action'],
      changes: (data.changes || {}) as ActivityChanges,
      created_at: data.created_at.toISOString(),
    };
  },

  getLogs: async (params?: ActivityLogsParams) => {
    const { page = 1, limit = 20, user_email, action } = params || {};

    const conditions = [];
    if (user_email) conditions.push(eq(activityLogs.user_email, user_email));
    if (action) conditions.push(eq(activityLogs.action, action));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const from = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      where
        ? db.select({ count: count() }).from(activityLogs).where(where)
        : db.select({ count: count() }).from(activityLogs),
      where
        ? db
            .select()
            .from(activityLogs)
            .where(where)
            .orderBy(desc(activityLogs.created_at))
            .limit(limit)
            .offset(from)
        : db
            .select()
            .from(activityLogs)
            .orderBy(desc(activityLogs.created_at))
            .limit(limit)
            .offset(from),
    ]);

    const total = countResult[0]?.count || 0;

    return {
      data: dataResult.map((row) => ({
        ...row,
        action: row.action as ActivityLog['action'],
        changes: (row.changes || {}) as ActivityChanges,
        created_at: row.created_at.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getUniqueUsers: async (): Promise<string[]> => {
    const result = await db
      .selectDistinct({ user_email: activityLogs.user_email })
      .from(activityLogs)
      .orderBy(activityLogs.user_email);

    return result.map((row) => row.user_email);
  },
};
