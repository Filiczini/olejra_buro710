import { useState, useCallback } from 'react';
import { logger } from '../lib/logger';
import { userService } from '../services/api';
import type { User, ApiError } from '@buro710/shared';

export interface UseUserActionsReturn {
  formLoading: boolean;
  passwordLoading: boolean;
  deleteTarget: User | null;
  passwordTarget: User | null;
  setDeleteTarget: (user: User | null) => void;
  setPasswordTarget: (user: User | null) => void;
  handleCreate: (data: {
    email: string;
    password: string;
    role: 'admin' | 'editor';
  }) => Promise<string | undefined>;
  handleDelete: () => Promise<string | undefined>;
  handleUpdatePassword: (userId: string, newPassword: string) => Promise<void>;
}

export function useUserActions(refresh: () => Promise<unknown>): UseUserActionsReturn {
  const [formLoading, setFormLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);

  const handleCreate = useCallback(
    async (data: { email: string; password: string; role: 'admin' | 'editor' }) => {
      setFormLoading(true);
      try {
        await userService.create(data);
        await refresh();
        return undefined;
      } catch (error: unknown) {
        logger.error('Error creating user', error);
        const msg = (error as ApiError)?.response?.data?.error || 'Не вдалося створити користувача';
        return msg;
      } finally {
        setFormLoading(false);
      }
    },
    [refresh]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return 'Не вибрано користувача';
    try {
      await userService.delete(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
      return undefined;
    } catch (error: unknown) {
      logger.error('Error deleting user', error);
      const msg = (error as ApiError)?.response?.data?.error || 'Не вдалося видалити користувача';
      return msg;
    }
  }, [deleteTarget, refresh]);

  const handleUpdatePassword = useCallback(async (userId: string, newPassword: string) => {
    setPasswordLoading(true);
    try {
      await userService.updatePassword(userId, newPassword);
      setPasswordTarget(null);
    } catch (error: unknown) {
      logger.error('Error updating password', error);
      throw new Error('Не вдалося оновити пароль');
    } finally {
      setPasswordLoading(false);
    }
  }, []);

  return {
    formLoading,
    passwordLoading,
    deleteTarget,
    passwordTarget,
    setDeleteTarget,
    setPasswordTarget,
    handleCreate,
    handleDelete,
    handleUpdatePassword,
  };
}
