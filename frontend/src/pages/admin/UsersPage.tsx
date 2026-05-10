import { useToast } from '../../hooks/useToast';
import { useUsers } from '../../hooks/useUsers';
import { useUserActions } from '../../hooks/useUserActions';
import { useUserColumns } from '../../hooks/useUserColumns';
import type { User } from '@buro710/shared';
import Toast from '../../components/ui/Toast';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/ui/ConfirmModal';
import CreateUserForm from '../../components/admin/CreateUserForm';
import ChangePasswordModal from '../../components/admin/ChangePasswordModal';

export default function UsersPage() {
  const { users, loading, refresh } = useUsers();
  const { toast, showToast, dismissToast } = useToast();

  const {
    formLoading,
    passwordLoading,
    deleteTarget,
    passwordTarget,
    setDeleteTarget,
    setPasswordTarget,
    handleCreate,
    handleDelete,
    handleUpdatePassword,
  } = useUserActions(refresh);

  const onCreate = async (data: { email: string; password: string; role: 'admin' | 'editor' }) => {
    const error = await handleCreate(data);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Користувача створено', 'success');
    }
  };

  const onDelete = async () => {
    const error = await handleDelete();
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Користувача видалено', 'success');
    }
  };

  const onUpdatePassword = async (userId: string, newPassword: string) => {
    try {
      await handleUpdatePassword(userId, newPassword);
      showToast('Пароль оновлено', 'success');
    } catch {
      showToast('Не вдалося оновити пароль', 'error');
    }
  };

  const userColumns = useUserColumns(
    (user: User) => setPasswordTarget(user),
    (user: User) => setDeleteTarget(user)
  );

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}

      <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">Користувачі</h2>

      <CreateUserForm onCreate={onCreate} formLoading={formLoading} />

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
        onConfirm={onDelete}
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
        onUpdate={onUpdatePassword}
        onClose={() => setPasswordTarget(null)}
        loading={passwordLoading}
      />
    </div>
  );
}
