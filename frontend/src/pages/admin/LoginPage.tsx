import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useLoginForm } from '../../hooks/useLoginForm';

export default function LoginPage() {
  const { credentials, error, loading, handleChange, handleSubmit } = useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">Вхід адміністратора</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            label="Email"
            placeholder="Введіть ваш email"
            value={credentials.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('email', e.target.value)
            }
            required
          />

          <Input
            type="password"
            label="Пароль"
            placeholder="Введіть ваш пароль"
            value={credentials.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('password', e.target.value)
            }
            required
          />

          {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full py-3">
            {loading ? 'Вхід...' : 'Увійти'}
          </Button>
        </form>
      </div>
    </div>
  );
}
