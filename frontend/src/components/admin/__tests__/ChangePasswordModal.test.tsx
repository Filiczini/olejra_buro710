import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePasswordModal from '../ChangePasswordModal';
import type { User } from '@buro710/shared';

const user: User = { id: 'u1', email: 'a@b.c', role: 'editor', created_at: '' };

describe('ChangePasswordModal', () => {
  it('is closed when there is no user', () => {
    render(
      <ChangePasswordModal user={null} onUpdate={vi.fn()} onClose={vi.fn()} loading={false} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it("shows the target user's email", () => {
    render(
      <ChangePasswordModal user={user} onUpdate={vi.fn()} onClose={vi.fn()} loading={false} />
    );

    expect(screen.getByText('a@b.c')).toBeInTheDocument();
  });

  it('rejects a password shorter than 6 characters without calling onUpdate', async () => {
    const onUpdate = vi.fn();
    render(
      <ChangePasswordModal user={user} onUpdate={onUpdate} onClose={vi.fn()} loading={false} />
    );

    fireEvent.change(screen.getByLabelText('Новий пароль', { exact: false }), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(screen.getByText('Пароль має бути не менше 6 символів')).toBeInTheDocument()
    );
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("calls onUpdate with the user's id and the new password", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <ChangePasswordModal user={user} onUpdate={onUpdate} onClose={vi.fn()} loading={false} />
    );

    fireEvent.change(screen.getByLabelText('Новий пароль', { exact: false }), {
      target: { value: 'new-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Зберегти' }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith('u1', 'new-secret'));
  });

  it('clears the password field and error when cancelled', () => {
    const onClose = vi.fn();
    render(
      <ChangePasswordModal user={user} onUpdate={vi.fn()} onClose={onClose} loading={false} />
    );

    fireEvent.change(screen.getByLabelText('Новий пароль', { exact: false }), {
      target: { value: 'partial' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables the save button and shows a loading label while saving', () => {
    render(<ChangePasswordModal user={user} onUpdate={vi.fn()} onClose={vi.fn()} loading />);

    expect(screen.getByRole('button', { name: 'Збереження...' })).toBeDisabled();
  });
});
