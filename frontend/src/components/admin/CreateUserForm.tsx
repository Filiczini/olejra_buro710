import { useState } from 'react';
import Input from '../../components/ui/Input';
import { PlusCircle } from 'lucide-react';

interface CreateUserFormProps {
  onCreate: (data: { email: string; password: string; role: 'admin' | 'editor' }) => Promise<void>;
  formLoading: boolean;
}

export default function CreateUserForm({ onCreate, formLoading }: CreateUserFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('admin');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email обов'язковий";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Невірний формат email';
    if (!password || password.length < 6) errors.password = 'Пароль має бути не менше 6 символів';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onCreate({ email, password, role });
    setEmail('');
    setPassword('');
    setRole('admin');
    setFormErrors({});
  };

  return (
    <div className="bg-white border border-gray-200/75 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Додати користувача</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
            placeholder="user@example.com"
            required
          />
        </div>
        <div className="md:col-span-3">
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={formErrors.password}
            placeholder="Мінімум 6 символів"
            required
          />
        </div>
        <div className="md:col-span-3">
          <label htmlFor="user-role" className="block text-sm font-medium text-zinc-700 mb-2">
            Роль
          </label>
          <div className="relative">
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'editor')}
              className="appearance-none w-full bg-white border border-zinc-200 text-zinc-900 py-3 pl-4 pr-10 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent cursor-pointer"
            >
              <option value="admin">Адміністратор</option>
              <option value="editor">Редактор</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={formLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-base font-medium rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="h-5 w-5 mr-2 stroke-[1.5]" />
            {formLoading ? 'Створення...' : 'Додати'}
          </button>
        </div>
      </form>
    </div>
  );
}
