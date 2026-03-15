import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns isAuthenticated false when no token', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns isAuthenticated true when token exists', () => {
    localStorage.setItem('token', 'valid-jwt-token');
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('handleLogout removes token and sets isAuthenticated to false', () => {
    localStorage.setItem('token', 'valid-jwt-token');
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.handleLogout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('responds to storage events for token changes', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: 'new-token' }));
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('responds to storage event removing token', () => {
    localStorage.setItem('token', 'existing-token');
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: null }));
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('ignores storage events for other keys', () => {
    localStorage.setItem('token', 'existing-token');
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other-key', newValue: null }));
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('cleans up storage event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    removeSpy.mockRestore();
  });
});
