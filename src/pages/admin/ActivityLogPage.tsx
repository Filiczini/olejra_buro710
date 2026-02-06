import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';
import Button from '../../components/ui/Button';

export default function ActivityLogPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          {t.activityLog.title}
        </h1>
        <p className="text-lg text-zinc-600 mb-8">
          {t.activityLog.comingSoon}
        </p>
        <Link to="/admin/dashboard">
          <Button>{t.activityLog.backToDashboard}</Button>
        </Link>
      </div>
    </div>
  );
}
