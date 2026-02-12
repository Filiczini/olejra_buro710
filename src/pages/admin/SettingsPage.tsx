import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          Налаштування
        </h1>
        <p className="text-lg text-zinc-600 mb-8">
          Ця функція скоро буде доступна
        </p>
        <Link to="/admin/dashboard">
          <Button>Повернутися до панелі керування</Button>
        </Link>
      </div>
    </div>
  );
}
