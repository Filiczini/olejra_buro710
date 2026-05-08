import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
  it('renders spinner while loading', () => {
    mockUseAuth.mockReturnValue({ isLoading: true, isAuthenticated: false });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected">secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });
    render(
      <MemoryRouter initialEntries={['/admin/posts']}>
        <ProtectedRoute>
          <div data-testid="protected">secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected">secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected')).toHaveTextContent('secret');
  });
});
