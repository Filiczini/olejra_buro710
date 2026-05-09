import { useState } from 'react';
import { logger } from '../../lib/logger';
import { useToast } from '../../hooks/useToast';
import { useUsers } from '../../hooks/useUsers';
import { userService } from '../../services/api';
import type { User } from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { PlusCircle, Trash2, KeyRound } from 'lucide-react';
import { formatDate } from '../../lib/date';
import DataTable from '../../components/admin/DataTable';
import type { ColumnDef } from '../../components/admin/DataTable';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Modal from '../../components/ui/Modal';

export default function UsersPage() {
  const { users, loading, refresh } = useUsers();
  const [formLoading, setFormLoading] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('admin');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email обов'язковий";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Невірний формат email';
    if (!password || password.length < 6) errors.password = 'Пароль має бути не менше 6 символів';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      await userService.create({ email, password, role });
      showToast('Користувача створено', 'success');
      setEmail('');
      setPassword('');
      setRole('admin');
      setFormErrors({});
      await refresh();
    } catch (error: unknown) {
      logger.error('Error creating user', error);
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Не вдалося створити користувача';
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
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Не вдалося видалити користувача';
      showToast(msg, 'error');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTarget) return;
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Пароль має бути не менше 6 символів');
      return;
    }
    setPasswordLoading(true);
    try {
      await userService.updatePassword(passwordTarget.id, newPassword);
      showToast('Пароль оновлено', 'success');
      setPasswordTarget(null);
      setNewPassword('');
      setPasswordError('');
    } catch (error: unknown) {
      logger.error('Error updating password', error);
      showToast('Не вдалося оновити пароль', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const userColumns: ColumnDef<User>[] = [
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
        <span className="text-base text-gray-500 tabular-nums">{formatDate(user.created_at)}</span>
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
          >
            <KeyRound className="h-5 w-5 stroke-[1.5]" />
          </button>
          <button
            onClick={() => setDeleteTarget(user)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            title="Видалити"
          >
            <Trash2 className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}

      <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">Користувачі</h2>

      {/* Create Form */}
      <div className="bg-white border border-gray-200/75 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Додати користувача</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="md:col-span-3">
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={formErrors.password}
              placeholder="Мінімум 6 символів"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-zinc-700 mb-2">Роль</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'editor')}
                className="appearance-none w-full bg-white border border-zinc-200 text-zinc-900 py-3 pl-4 pr-10 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent cursor-pointer"
              >
                <option value="admin">Адміністратор</option>
                <option value="editor">Редактор</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={formLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-base font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="h-5 w-5 mr-2 stroke-[1.5]" />
              {formLoading ? 'Створення...' : 'Додати'}
            </button>
          </div>
        </form>
      </div>

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

      <Modal
        isOpen={!!passwordTarget}
        onClose={() => {
          setPasswordTarget(null);
          setNewPassword('');
          setPasswordError('');
        }}
        title="Зміна пароля"
      >
        <p className="text-sm text-zinc-500 mb-4">
          Новий пароль для{' '}
          <span className="font-medium text-zinc-900">{passwordTarget?.email}</span>
        </p>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="Новий пароль"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError('');
            }}
            error={passwordError}
            placeholder="Мінімум 6 символів"
            required
          />
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPasswordTarget(null);
                setNewPassword('');
                setPasswordError('');
              }}
            >
              Скасувати
            </Button>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2.5 rounded-full font-medium transition-all cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {passwordLoading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
