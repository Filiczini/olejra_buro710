import { useMemo } from 'react';
import { Trash2, KeyRound } from 'lucide-react';
import { formatDate } from '../lib/date';
import type { ColumnDef } from '../components/admin/DataTable';
import type { User } from '@buro710/shared';

export function useUserColumns(
  onPassword: (user: User) => void,
  onDelete: (user: User) => void
): ColumnDef<User>[] {
  return useMemo<ColumnDef<User>[]>(
    () => [
      {
        key: 'email',
        header: 'Email',
        cell: (user) => <span className="text-base font-medium text-gray-900">{user.email}</span>,
      },
      {
        key: 'role',
        header: 'Роль',
        cell: (user) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ring-1 ring-inset ${
              user.role === 'admin'
                ? 'bg-zinc-100 text-zinc-700 ring-zinc-600/20'
                : 'bg-blue-50 text-blue-700 ring-blue-600/20'
            }`}
          >
            {user.role === 'admin' ? 'Адміністратор' : 'Редактор'}
          </span>
        ),
      },
      {
        key: 'created',
        header: 'Створено',
        cell: (user) => (
          <span className="text-base text-gray-500 tabular-nums">
            {formatDate(user.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: <span className="text-right block">Дії</span>,
        cell: (user) => (
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onPassword(user)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
              title="Змінити пароль"
              aria-label="Змінити пароль"
            >
              <KeyRound className="h-5 w-5 stroke-[1.5]" />
            </button>
            <button
              onClick={() => onDelete(user)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              title="Видалити"
              aria-label="Видалити користувача"
            >
              <Trash2 className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>
        ),
      },
    ],
    [onPassword, onDelete]
  );
}
