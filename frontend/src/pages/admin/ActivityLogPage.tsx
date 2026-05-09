import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '../../lib/logger';
import { ChevronDown } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import type { ColumnDef } from '../../components/admin/DataTable';
import { activityLogService } from '../../services/api';
import type { ActivityLog, ActivityLogsParams } from '@buro710/shared';
import { useAdminListPage } from '../../hooks/useAdminListPage';
import { formatDate } from '../../lib/date';
import {
  getEntityTypeBadge,
  getEntityTypeText,
  formatChanges,
  getActionBadge,
  getActionText,
} from '../../lib/activityLogFormatters';

export default function ActivityLogPage() {
  const {
    data: logs,
    loading,
    pagination,
    filters,
    setFilter,
    setPage,
  } = useAdminListPage<ActivityLog, ActivityLogsParams>({
    fetchData: (params) => activityLogService.getAll(params),
    defaultLimit: 20,
  });

  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);

  useEffect(() => {
    activityLogService
      .getUniqueUsers()
      .then(setUniqueUsers)
      .catch((error) => {
        logger.error('Error loading users', error);
      });
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof ActivityLogsParams, value: string | undefined) => {
      setFilter(key, value === '' ? undefined : value);
      setPage(1);
    },
    [setFilter, setPage]
  );

  const logColumns = useMemo<ColumnDef<ActivityLog>[]>(
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

  return (
    <DataTable
      data={logs}
      columns={logColumns}
      rowKey={(log) => log.id}
      isLoading={loading}
      emptyMessage="Журнал порожній"
      pagination={{
        page: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
        limit: pagination.limit,
        onPageChange: setPage,
      }}
      header={
        <div className="p-8 pb-4">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">Журнал дій</h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pb-6 border-b border-gray-100">
            <div className="md:col-span-3">
              <label htmlFor="filter-user" className="block text-xs font-medium text-gray-500 mb-2">
                Користувач
              </label>
              <div className="relative">
                <select
                  id="filter-user"
                  name="filter_user"
                  className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-900 py-2.5 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all cursor-pointer"
                  value={filters.user_email || ''}
                  onChange={(e) => handleFilterChange('user_email', e.target.value)}
                >
                  <option value="">Всі користувачі</option>
                  {uniqueUsers.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <ChevronDown className="h-4 w-4 stroke-[1.5]" />
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="filter-action"
                className="block text-xs font-medium text-gray-500 mb-2"
              >
                Тип дії
              </label>
              <div className="relative">
                <select
                  id="filter-action"
                  name="filter_action"
                  className="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-900 py-2.5 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all cursor-pointer"
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <option value="">Всі дії</option>
                  <option value="create">Створення</option>
                  <option value="update">Редагування</option>
                  <option value="delete">Видалення</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <ChevronDown className="h-4 w-4 stroke-[1.5]" />
                </div>
              </div>
            </div>

            <div className="md:col-span-3 md:col-start-10 flex justify-end">
              <button
                onClick={() => {
                  setFilter('user_email', undefined);
                  setFilter('action', undefined);
                  setPage(1);
                }}
                className="w-full md:w-auto px-6 py-2.5 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full text-sm font-medium transition-all focus:ring-2 focus:ring-offset-1 focus:ring-gray-100 cursor-pointer"
              >
                Очистити фільтри
              </button>
            </div>
          </div>
        </div>
      }
      className="max-w-7xl mx-auto border border-gray-200/75"
    />
  );
}
