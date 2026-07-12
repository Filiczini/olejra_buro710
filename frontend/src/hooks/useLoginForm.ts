import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { authService } from '../services/api';
import type { LoginCredentials } from '@buro710/shared';

export interface UseLoginFormReturn {
  credentials: LoginCredentials;
  error: string;
  loading: boolean;
  handleChange: (field: keyof LoginCredentials, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useLoginForm(): UseLoginFormReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cookie-based session: probe /admin/me and redirect if already logged in.
    // Seed the auth query cache BEFORE navigating, otherwise ProtectedRoute
    // reads a stale cached null and bounces back here (redirect loop).
    api
      .get('/admin/me')
      .then((response) => {
        queryClient.setQueryData(['auth', 'me'], response.data);
        navigate('/admin/posts', { replace: true });
      })
      .catch(() => {
        // Not authenticated — stay on the login page
      });
  }, [navigate, queryClient]);

  const handleChange = useCallback((field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const response = await authService.login(credentials.email, credentials.password);
        // Same cache-seeding as above — ProtectedRoute must see the fresh user
        queryClient.setQueryData(['auth', 'me'], response.user);
        navigate('/admin/posts');
      } catch {
        setError('Невірний email або пароль');
      } finally {
        setLoading(false);
      }
    },
    [credentials, navigate, queryClient]
  );

  return { credentials, error, loading, handleChange, handleSubmit };
}
