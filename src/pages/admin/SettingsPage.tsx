import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import Button from '../../components/ui/Button';

export default function SettingsPage() {
  const t = useTranslation();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          {t.settings.title}
        </h1>
        <p className="text-lg text-zinc-600 mb-8">
          {t.settings.comingSoon}
        </p>
        <Link to="/admin/dashboard">
          <Button>{t.settings.backToDashboard}</Button>
        </Link>
      </div>
    </div>
  );
}
