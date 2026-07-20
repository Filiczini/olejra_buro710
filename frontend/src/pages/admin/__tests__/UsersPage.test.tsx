import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { User } from '@buro710/shared';

vi.mock('../../../services/api', () => ({
  userService: { getAll: vi.fn(), create: vi.fn(), delete: vi.fn(), updatePassword: vi.fn() },
}));
vi.mock('../../../lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

import UsersPage from '../UsersPage';
import { userService } from '../../../services/api';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'diana@b710.design',
    role: 'editor',
    created_at: '2026-07-18T10:00:00.000Z',
    ...overrides,
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(userService.getAll).mockResolvedValue([]);
});

describe('UsersPage', () => {
  it('renders the fetched users with a role badge', async () => {
    vi.mocked(userService.getAll).mockResolvedValue([makeUser()]);

    renderPage();

    await waitFor(() => expect(screen.getByText('diana@b710.design')).toBeInTheDocument());
    expect(within(screen.getByRole('table')).getByText('Редактор')).toBeInTheDocument();
  });

  it('creates a user and shows a success toast, refreshing the list', async () => {
    vi.mocked(userService.create).mockResolvedValue(makeUser());
    renderPage();
    await waitFor(() => expect(userService.getAll).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
      target: { value: 'new@b710.design' },
    });
    fireEvent.change(screen.getByPlaceholderText('Мінімум 6 символів'), {
      target: { value: 'secret123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /додати/i }).closest('form')!);

    await waitFor(() =>
      expect(userService.create).toHaveBeenCalledWith({
        email: 'new@b710.design',
        password: 'secret123',
        role: 'admin',
      })
    );
    await waitFor(() => expect(screen.getByText('Користувача створено')).toBeInTheDocument());
    await waitFor(() => expect(userService.getAll).toHaveBeenCalledTimes(2));
  });

  it('shows the backend error toast when user creation fails', async () => {
    vi.mocked(userService.create).mockRejectedValue({
      response: { data: { error: 'Email already exists' } },
    });
    renderPage();
    await waitFor(() => expect(userService.getAll).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
      target: { value: 'dup@b710.design' },
    });
    fireEvent.change(screen.getByPlaceholderText('Мінімум 6 символів'), {
      target: { value: 'secret123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /додати/i }).closest('form')!);

    await waitFor(() => expect(screen.getByText('Email already exists')).toBeInTheDocument());
  });

  it('deletes a user after confirmation', async () => {
    vi.mocked(userService.getAll).mockResolvedValue([makeUser()]);
    vi.mocked(userService.delete).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => expect(screen.getByText('diana@b710.design')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Видалити користувача' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Видалити' }));

    await waitFor(() => expect(userService.delete).toHaveBeenCalledWith('u1'));
    await waitFor(() => expect(screen.getByText('Користувача видалено')).toBeInTheDocument());
  });

  it('changes a user password through the modal', async () => {
    vi.mocked(userService.getAll).mockResolvedValue([makeUser()]);
    vi.mocked(userService.updatePassword).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => expect(screen.getByText('diana@b710.design')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Змінити пароль' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByPlaceholderText('Мінімум 6 символів'), {
      target: { value: 'new-secret' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Зберегти' }));

    await waitFor(() =>
      expect(userService.updatePassword).toHaveBeenCalledWith('u1', 'new-secret')
    );
    await waitFor(() => expect(screen.getByText('Пароль оновлено')).toBeInTheDocument());
  });
});
