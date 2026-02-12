import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { activityLogService } from '../../services/api';
import type { ActivityLog, ActivityLogsParams } from '../../types/activityLog';

export default function ActivityLogPage() {

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<ActivityLogsParams>({});
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await activityLogService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      setLogs(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUniqueUsers = async () => {
    try {
      const users = await activityLogService.getUniqueUsers();
      setUniqueUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [pagination.page, filters.user_email, filters.action]);

  useEffect(() => {
    loadUniqueUsers();
  }, []);

  const handleFilterChange = (key: keyof ActivityLogsParams, value: any) => {
    setFilters({ ...filters, [key]: value === '' ? undefined : value });
    setPagination({ ...pagination, page: 1 });
  };

  const formatChanges = (changes: any) => {
    if (!changes || Object.keys(changes).length === 0) return '-';

    const parts: string[] = [];

    if (changes.fields && changes.fields.length > 0) {
      parts.push(`Змінено поля: ${changes.fields.join(', ')}`);
    }

    if (changes.media_added > 0) {
      parts.push(`Додано медіа: ${changes.media_added}`);
    }

    if (changes.media_removed > 0) {
      parts.push(`Видалено медіа: ${changes.media_removed}`);
    }

    if (changes.media_reordered) {
      parts.push('Змінено порядок медіа');
    }

    return parts.length > 0 ? parts.join(' | ') : '-';
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-700';
      case 'update':
        return 'bg-blue-100 text-blue-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'create':
        return 'Створення';
      case 'update':
        return 'Редагування';
      case 'delete':
        return 'Видалення';
      default:
        return action;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">Журнал дій</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-zinc-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Користувач
            </label>
            <select
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Тип дії
            </label>
            <select
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">Всі дії</option>
              <option value="create">Створення</option>
              <option value="update">Редагування</option>
              <option value="delete">Видалення</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ user_email: undefined, action: undefined })}
              variant="secondary"
              className="w-full"
            >
              Очистити фільтри
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-zinc-600">
              Завантаження...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-zinc-600">
              Журнал порожній
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Дата</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Користувач</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Дія</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Проєкт</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-700">Деталі</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 text-zinc-600">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-zinc-900 font-medium">
                      {log.user_email}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                        {getActionText(log.action)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-900">
                      {log.entity_title}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 text-sm">
                      {formatChanges(log.changes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-200">
            <div className="text-sm text-zinc-600">
              Показано {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)} з {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Попередня
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const page = Math.max(1, pagination.page - 2) + i;
                if (page > pagination.totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors ${
                      page === pagination.page ? 'bg-zinc-900 text-white' : ''
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Наступна
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
