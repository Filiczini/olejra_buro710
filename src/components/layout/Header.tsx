import { Icon } from '@iconify-icon/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';

export default function Header() {
  const { isAuthenticated, handleLogout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/50">
      <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="text-xl tracking-tight font-medium hover:opacity-70 transition-opacity">
          BURO 710
        </a>
        <nav className="hidden md:flex items-center gap-10">
          <a href="/projects" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">{t.navigation.projects}</a>
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">{language === 'uk' ? 'Про бюро' : 'About'}</a>
          <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">{language === 'uk' ? 'Контакти' : 'Contact'}</a>
        </nav>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <a href="/admin/dashboard" className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                <Icon icon="solar:user-circle-linear" width={18} />
                <span>{t.header.admin}</span>
              </a>
              <button
                onClick={() => {
                  handleLogout();
                  navigate('/');
                }}
                className="text-sm font-medium bg-zinc-900 text-white px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
              >
                {t.header.logout}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
