import { useState, useMemo } from 'react';
import { logger } from '../../lib/logger';
import { useToast } from '../../hooks/useToast';
import { useUsers } from '../../hooks/useUsers';
import { userService } from '../../services/api';
import type { User } from '../../services/api';
import type { ApiError } from '../../types/api';
import Toast from '../../components/ui/Toast';
import { Trash2, KeyRound } from 'lucide-react';
import { formatDate } from '../../lib/date';
import DataTable from '../../components/admin/DataTable';
import type { ColumnDef } from '../../components/admin/DataTable';
import ConfirmModal from '../../components/ui/ConfirmModal';
import CreateUserForm from '../../components/admin/CreateUserForm';
import ChangePasswordModal from '../../components/admin/ChangePasswordModal';

export default function UsersPage() {
  const { users, loading, refresh } = useUsers();
  const [formLoading, setFormLoading] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleCreate = async (data: {
    email: string;
    password: string;
    role: 'admin' | 'editor';
  }) => {
    setFormLoading(true);
    try {
      await userService.create(data);
      showToast('Користувача створено', 'success');
      await refresh();
    } catch (error: unknown) {
      logger.error('Error creating user', error);
      const msg = (error as ApiError)?.response?.data?.error || 'Не вдалося створити користувача';
      showToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await userService.delete(deleteTarget.id);
      showToast('Користувача видалено', 'success');
      setDeleteTarget(null);
      await refresh();
    } catch (error: unknown) {
      logger.error('Error deleting user', error);
      const msg = (error as ApiError)?.response?.data?.error || 'Не вдалося видалити користувача';
      showToast(msg, 'error');
    }
  };

  const handleUpdatePassword = async (userId: number, newPassword: string) => {
    setPasswordLoading(true);
    try {
      await userService.updatePassword(userId, newPassword);
      showToast('Пароль оновлено', 'success');
      setPasswordTarget(null);
    } catch (error: unknown) {
      logger.error('Error updating password', error);
      showToast('Не вдалося оновити пароль', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const userColumns = useMemo<ColumnDef<User>[]>(
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
              onClick={() => setPasswordTarget(user)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
              title="Змінити пароль"
              aria-label="Змінити пароль"
            >
              <KeyRound className="h-5 w-5 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setDeleteTarget(user)}
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
    []
  );

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}

      <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">Користувачі</h2>

      <CreateUserForm onCreate={handleCreate} formLoading={formLoading} />

      <DataTable
        data={users}
        columns={userColumns}
        rowKey={(user) => user.id}
        isLoading={loading}
        emptyMessage="Користувачів не знайдено"
        className="border border-gray-200/75"
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Підтвердження видалення"
        message={
          <>
            Видалити користувача{' '}
            <span className="font-medium text-zinc-900">{deleteTarget?.email}</span>? Цю дію не
            можна скасувати.
          </>
        }
        confirmText="Видалити"
        variant="danger"
      />

      <ChangePasswordModal
        user={passwordTarget}
        onUpdate={handleUpdatePassword}
        onClose={() => setPasswordTarget(null)}
        loading={passwordLoading}
      />
    </div>
  );
}
