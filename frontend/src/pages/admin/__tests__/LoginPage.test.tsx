import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

const { mockLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockApiGet = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as Record<string, unknown>),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../services/api', () => ({
  authService: {
    login: mockLogin,
  },
}));

vi.mock('../../../api/client', () => ({
  default: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockApiGet.mockReset();
    // Default: no active session — the /admin/me probe rejects
    mockApiGet.mockRejectedValue(new Error('unauthenticated'));
  });

  it('redirects when session cookie is still valid', async () => {
    mockApiGet.mockResolvedValue({ data: { id: '1', email: 'a@b.c', role: 'admin' } });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/admin/posts', { replace: true })
    );
  });

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Введіть ваш email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Введіть ваш пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /увійти/i })).toBeInTheDocument();
  });

  it('submits credentials and redirects on success', async () => {
    mockLogin.mockResolvedValueOnce({
      user: { id: 'u1', email: 'a@b.c' },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Введіть ваш email/i), {
      target: { value: 'a@b.c' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Введіть ваш пароль/i), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /увійти/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('a@b.c', 'secret'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/posts');
  });

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('bad creds'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Введіть ваш email/i), {
      target: { value: 'a@b.c' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Введіть ваш пароль/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /увійти/i }));

    await waitFor(() => expect(screen.getByText(/невірний email або пароль/i)).toBeInTheDocument());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables button and shows loading text while submitting', async () => {
    let resolveLogin: () => void;
    mockLogin.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogin = () => resolve({ user: {} });
        })
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Введіть ваш email/i), {
      target: { value: 'a@b.c' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Введіть ваш пароль/i), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /увійти/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /вхід/i })).toBeDisabled());

    resolveLogin!();
    await waitFor(() => expect(screen.getByRole('button', { name: /увійти/i })).toBeEnabled());
  });
});
