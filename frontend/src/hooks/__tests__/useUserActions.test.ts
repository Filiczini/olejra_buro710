import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../../services/api', () => ({
  userService: { create: vi.fn(), delete: vi.fn(), updatePassword: vi.fn() },
}));
vi.mock('../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import { useUserActions } from '../useUserActions';
import { userService } from '../../services/api';
import type { User } from '@buro710/shared';

function makeUser(overrides: Partial<User> = {}): User {
  return { id: 'u1', email: 'a@b.c', role: 'editor', created_at: '', ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUserActions', () => {
  it('handleCreate creates the user, refreshes the list, and returns no error on success', async () => {
    vi.mocked(userService.create).mockResolvedValue(makeUser());
    const refresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useUserActions(refresh));

    let error: string | undefined;
    await act(async () => {
      error = await result.current.handleCreate({
        email: 'a@b.c',
        password: 'secret123',
        role: 'editor',
      });
    });

    expect(error).toBeUndefined();
    expect(refresh).toHaveBeenCalled();
    expect(result.current.formLoading).toBe(false);
  });

  it('handleCreate returns the backend error message on failure', async () => {
    vi.mocked(userService.create).mockRejectedValue({
      response: { data: { error: 'Email already exists' } },
    });
    const refresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useUserActions(refresh));

    let error: string | undefined;
    await act(async () => {
      error = await result.current.handleCreate({
        email: 'a@b.c',
        password: 'secret123',
        role: 'editor',
      });
    });

    expect(error).toBe('Email already exists');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('handleCreate falls back to a generic message when the backend sends none', async () => {
    vi.mocked(userService.create).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useUserActions(vi.fn()));

    let error: string | undefined;
    await act(async () => {
      error = await result.current.handleCreate({
        email: 'a@b.c',
        password: 'secret123',
        role: 'editor',
      });
    });

    expect(error).toBe('Не вдалося створити користувача');
  });

  it('handleDelete without a target returns an error and does not call the API', async () => {
    const { result } = renderHook(() => useUserActions(vi.fn()));

    let error: string | undefined;
    await act(async () => {
      error = await result.current.handleDelete();
    });

    expect(error).toBe('Не вибрано користувача');
    expect(userService.delete).not.toHaveBeenCalled();
  });

  it('handleDelete removes the selected user and clears the target on success', async () => {
    vi.mocked(userService.delete).mockResolvedValue(undefined);
    const refresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useUserActions(refresh));

    act(() => {
      result.current.setDeleteTarget(makeUser({ id: 'u2' }));
    });

    let error: string | undefined;
    await act(async () => {
      error = await result.current.handleDelete();
    });

    expect(error).toBeUndefined();
    expect(userService.delete).toHaveBeenCalledWith('u2');
    expect(result.current.deleteTarget).toBeNull();
    expect(refresh).toHaveBeenCalled();
  });

  it('handleDelete keeps the target set and returns an error message on failure', async () => {
    vi.mocked(userService.delete).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useUserActions(vi.fn()));
    const target = makeUser({ id: 'u2' });

    act(() => {
      result.current.setDeleteTarget(target);
    });

    let error: string | undefined;
    await act(async () => {
      error = await result.current.handleDelete();
    });

    expect(error).toBe('Не вдалося видалити користувача');
    expect(result.current.deleteTarget).toEqual(target);
  });

  it('handleUpdatePassword clears the password target on success', async () => {
    vi.mocked(userService.updatePassword).mockResolvedValue(undefined);
    const { result } = renderHook(() => useUserActions(vi.fn()));

    act(() => {
      result.current.setPasswordTarget(makeUser());
    });
    await act(async () => {
      await result.current.handleUpdatePassword('u1', 'new-secret');
    });

    expect(userService.updatePassword).toHaveBeenCalledWith('u1', 'new-secret');
    expect(result.current.passwordTarget).toBeNull();
    expect(result.current.passwordLoading).toBe(false);
  });

  it('handleUpdatePassword throws a generic error and keeps loading state consistent on failure', async () => {
    vi.mocked(userService.updatePassword).mockRejectedValue(new Error('server error'));
    const { result } = renderHook(() => useUserActions(vi.fn()));

    await expect(
      act(async () => {
        await result.current.handleUpdatePassword('u1', 'new-secret');
      })
    ).rejects.toThrow('Не вдалося оновити пароль');

    expect(result.current.passwordLoading).toBe(false);
  });
});
