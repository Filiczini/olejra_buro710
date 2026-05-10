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
    const token = localStorage.getItem('token');
    if (!token) return;

    api
      .get('/admin/me')
      .then(() => navigate('/admin/posts', { replace: true }))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
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
        const response = await authService.login(credentials.email, credentials.password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
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
