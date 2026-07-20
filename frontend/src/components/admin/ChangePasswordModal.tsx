import { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import type { User } from '@buro710/shared';

interface ChangePasswordModalProps {
  user: User | null;
  onUpdate: (userId: string, newPassword: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export default function ChangePasswordModal({
  user,
  onUpdate,
  onClose,
  loading,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Пароль має бути не менше 6 символів');
      return;
    }
    await onUpdate(user.id, newPassword);
    setNewPassword('');
    setPasswordError('');
  };

  const handleClose = () => {
    setNewPassword('');
    setPasswordError('');
    onClose();
  };

  return (
    <Modal isOpen={!!user} onClose={handleClose} title="Зміна пароля">
      <p className="text-sm text-zinc-500 mb-4">
        Новий пароль для <span className="font-medium text-zinc-900">{user?.email}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="change-user-password"
          name="password"
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
          <Button type="button" variant="secondary" onClick={handleClose}>
            Скасувати
          </Button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-full font-medium transition-all cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
