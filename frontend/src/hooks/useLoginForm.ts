import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cookie-based session: probe /admin/me and redirect if already logged in
    api
      .get('/admin/me')
      .then(() => navigate('/admin/posts', { replace: true }))
      .catch(() => {
        // Not authenticated — stay on the login page
      });
  }, [navigate]);

  const handleChange = useCallback((field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        await authService.login(credentials.email, credentials.password);
        navigate('/admin/posts');
      } catch {
        setError('Невірний email або пароль');
      } finally {
        setLoading(false);
      }
    },
    [credentials, navigate]
  );

  return { credentials, error, loading, handleChange, handleSubmit };
}
