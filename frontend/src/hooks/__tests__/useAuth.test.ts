import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock the API client
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../../api/client', () => ({
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockPost.mockResolvedValue({});
  });

  it('returns isAuthenticated false when no token', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns isAuthenticated true when token exists and API validates', async () => {
    localStorage.setItem('token', 'valid-jwt-token');
    mockGet.mockResolvedValue({ data: { id: '1', email: 'admin@test.com', role: 'admin' } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(mockGet).toHaveBeenCalledWith('/admin/me');
  });

  it('returns isAuthenticated false when token exists but API rejects', async () => {
    localStorage.setItem('token', 'expired-token');
    mockGet.mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('handleLogout calls API and removes token', async () => {
    localStorage.setItem('token', 'valid-jwt-token');
    mockGet.mockResolvedValue({ data: { id: '1', email: 'admin@test.com', role: 'admin' } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockPost).toHaveBeenCalledWith('/admin/logout');
  });

  it('responds to storage events for token changes', async () => {
    mockGet.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: 'new-token' }));
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('responds to storage event removing token', async () => {
    localStorage.setItem('token', 'existing-token');
    mockGet.mockResolvedValue({ data: { id: '1', email: 'admin@test.com', role: 'admin' } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: null }));
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('ignores storage events for other keys', async () => {
    localStorage.setItem('token', 'existing-token');
    mockGet.mockResolvedValue({ data: { id: '1', email: 'admin@test.com', role: 'admin' } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other-key', newValue: null }));
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('cleans up storage event listener on unmount', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(removeSpy).toBeDefined();
    });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    removeSpy.mockRestore();
  });
});
