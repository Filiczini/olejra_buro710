import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await api.get('/admin/me');
        setIsAuthenticated(true);
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        // Don't clear tokens on 401 — the API interceptor handles refresh/redirect
        if (status !== 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        setIsAuthenticated(!!e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/admin/logout');
    } catch {
      // Continue with local cleanup
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, handleLogout };
}
