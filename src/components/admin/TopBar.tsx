import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';

interface TopBarProps {
  onMobileMenuClick?: () => void;
}

export default function TopBar({ onMobileMenuClick }: TopBarProps) {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 z-30">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Mobile only */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            if (onMobileMenuClick) onMobileMenuClick();
          }}
          className="md:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Icon icon="solar:hamburger-menu-linear" width={24} />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <Icon icon="solar:user-circle-linear" width={20} className="text-zinc-600" />
          <span className="text-sm text-zinc-600">admin</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Toggle language"
        >
          <Icon icon={language === 'uk' ? 'flagpack:ua' : 'flagpack:us'} width={20} />
          <span className="text-sm font-medium text-zinc-600">{language.toUpperCase()}</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
          aria-label="Logout"
        >
          <Icon icon="solar:logout-linear" width={20} />
          <span className="text-sm font-medium hidden sm:inline">{t.topBar.logout}</span>
        </button>
      </div>
    </header>
  );
}
