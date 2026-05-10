import { useMemo } from 'react';
import type { ActivityLog } from '@buro710/shared';
import type { ColumnDef } from '../../components/admin/DataTable';
import { formatDate } from '../../lib/date';
import {
  getEntityTypeBadge,
  getEntityTypeText,
  formatChanges,
  getActionBadge,
  getActionText,
} from '../../lib/activityLogFormatters';

export function useActivityLogColumns(): ColumnDef<ActivityLog>[] {
  return useMemo<ColumnDef<ActivityLog>[]>(
    () => [
      {
        key: 'date',
        header: 'Дата',
        width: '180px',
        cell: (log) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{formatDate(log.created_at)}</span>
            <span className="text-sm text-gray-400 mt-0.5">
              {new Date(log.created_at).toLocaleTimeString('uk-UA')}
            </span>
          </div>
        ),
      },
      {
        key: 'user',
        header: 'Користувач',
        width: '220px',
        cell: (log) => <span className="text-sm font-medium text-gray-900">{log.user_email}</span>,
      },
      {
        key: 'action',
        header: 'Дія',
        width: '140px',
        cell: (log) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getActionBadge(log.action)}`}
          >
            {getActionText(log.action)}
          </span>
        ),
      },
      {
        key: 'entity',
        header: "Об'єкт",
        cell: (log) => (
          <div className="flex flex-col items-start gap-1.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${getEntityTypeBadge(log.entity_type)}`}
            >
              {getEntityTypeText(log.entity_type)}
            </span>
            <span className="text-sm font-medium text-gray-900">{log.entity_title}</span>
          </div>
        ),
      },
      {
        key: 'details',
        header: 'Деталі',
        cell: (log) => (
          <span className="text-sm text-gray-500">
            {formatChanges(log.changes as Record<string, unknown>)}
          </span>
        ),
      },
    ],
    []
  );
}
