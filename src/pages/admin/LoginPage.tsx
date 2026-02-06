import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authService } from '../../services/api';
import type { LoginCredentials } from '../../types/auth';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';

export default function LoginPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(credentials.email, credentials.password);
      localStorage.setItem('token', response.token);
      navigate('/admin/dashboard');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || t.login.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">{t.login.title}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            label={t.login.email}
            placeholder={t.login.emailPlaceholder}
            value={credentials.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCredentials({ ...credentials, email: e.target.value })}
            required
          />

          <Input
            type="password"
            label={t.login.password}
            placeholder={t.login.passwordPlaceholder}
            value={credentials.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full py-3">
            {loading ? t.login.loggingIn : t.login.login}
          </Button>
        </form>
      </div>
    </div>
  );
}
