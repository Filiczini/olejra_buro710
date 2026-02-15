import { Icon } from '@iconify-icon/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const { isAuthenticated, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // When transparent is false, always show solid header
  // When transparent is true, show transparent until scrolled
  const isTransparent = transparent && !scrolled;

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${isTransparent ? 'border-transparent' : 'bg-white/95 backdrop-blur-md border-zinc-100'}`}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-10 h-20 md:h-24 flex items-center justify-between">
        <a href="/" className={`text-base md:text-lg font-medium tracking-tight uppercase transition-all duration-300 ${isTransparent ? 'text-white' : 'text-zinc-900'} hover:opacity-70 hover:scale-105`}>
          Buro 710
        </a>
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-10">
          <a href="/projects" className={`nav-link text-xs font-medium uppercase tracking-wide transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'} hover:scale-105`}>Проєкти</a>
          <a href="/about" className={`nav-link text-xs font-medium uppercase tracking-wide transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'} hover:scale-105`}>Про бюро</a>
          <a href="/contact" className={`nav-link text-xs font-medium uppercase tracking-wide transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'} hover:scale-105`}>Контакти</a>
        </nav>
        <div className="flex items-center gap-6 md:gap-8">
          {isAuthenticated ? (
            <>
              <a href="/admin/dashboard" className={`hidden md:flex items-center gap-2 text-xs font-medium transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'} hover:scale-105`}>
                <Icon icon="solar:user-circle-linear" width={16} />
                <span>Адмін</span>
              </a>
              <button
                onClick={() => {
                  handleLogout();
                  navigate('/');
                }}
                className={`text-xs font-medium px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer ${isTransparent ? 'bg-white text-zinc-900 hover:bg-zinc-200 hover:shadow-zinc-900/20' : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-zinc-900/20'}`}
              >
                Вийти
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
