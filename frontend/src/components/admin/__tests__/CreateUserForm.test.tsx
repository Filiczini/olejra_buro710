import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateUserForm from '../CreateUserForm';

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Email', { exact: false }), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Пароль', { exact: false }), {
    target: { value: password },
  });
  fireEvent.submit(screen.getByRole('button', { name: /додати/i }).closest('form')!);
}

describe('CreateUserForm', () => {
  it('rejects submission with a missing email', async () => {
    const onCreate = vi.fn();
    render(<CreateUserForm onCreate={onCreate} formLoading={false} />);

    fillAndSubmit('', 'secret123');

    await waitFor(() => expect(screen.getByText("Email обов'язковий")).toBeInTheDocument());
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('rejects an invalid email format', async () => {
    const onCreate = vi.fn();
    render(<CreateUserForm onCreate={onCreate} formLoading={false} />);

    fillAndSubmit('not-an-email', 'secret123');

    await waitFor(() => expect(screen.getByText('Невірний формат email')).toBeInTheDocument());
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('rejects a password shorter than 6 characters', async () => {
    const onCreate = vi.fn();
    render(<CreateUserForm onCreate={onCreate} formLoading={false} />);

    fillAndSubmit('a@b.c', '123');

    await waitFor(() =>
      expect(screen.getByText('Пароль має бути не менше 6 символів')).toBeInTheDocument()
    );
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('submits with the default admin role and resets the form on success', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateUserForm onCreate={onCreate} formLoading={false} />);

    fillAndSubmit('a@b.c', 'secret123');

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({
        email: 'a@b.c',
        password: 'secret123',
        role: 'admin',
      })
    );
    await waitFor(() => expect(screen.getByLabelText('Email', { exact: false })).toHaveValue(''));
  });

  it('submits with the editor role when selected', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateUserForm onCreate={onCreate} formLoading={false} />);

    fireEvent.change(screen.getByLabelText('Роль'), { target: { value: 'editor' } });
    fillAndSubmit('a@b.c', 'secret123');

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({
        email: 'a@b.c',
        password: 'secret123',
        role: 'editor',
      })
    );
  });

  it('disables the submit button and shows a loading label while formLoading', () => {
    render(<CreateUserForm onCreate={vi.fn()} formLoading />);

    expect(screen.getByRole('button', { name: /створення/i })).toBeDisabled();
  });
});
