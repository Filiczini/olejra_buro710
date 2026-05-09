import { Icon } from '@iconify-icon/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState, useRef, useCallback } from 'react';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const { isAuthenticated, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleMobileTabTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !mobileMenuRef.current) return;
    const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }
  };

  const lastScrollTime = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime.current < 100) return;
      lastScrollTime.current = now;
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleMobileTabTrap);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleMobileTabTrap);
    };
  }, [mobileMenuOpen, handleMobileTabTrap]);

  // When transparent is false, always show solid header
  // When transparent is true, show transparent until scrolled
  const isTransparent = transparent && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${isTransparent ? 'border-transparent' : 'bg-white/95 backdrop-blur-md border-zinc-100'}`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 h-20 md:h-24 flex items-center justify-between">
          <a
            href="/"
            className={`text-base md:text-lg font-medium tracking-tight uppercase transition-all duration-300 ${isTransparent ? 'text-white' : 'text-zinc-900'} hover:opacity-70 hover:scale-105`}
          >
            Buro 710
          </a>
          <button
            className="md:hidden p-2 -mr-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Відкрити меню"
          >
            <Icon
              icon="solar:hamburger-menu-linear"
              width={24}
              className={isTransparent ? 'text-white' : 'text-zinc-900'}
            />
          </button>
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-10">
            <a
              href="/projects"
              className={`nav-link text-xs font-medium uppercase tracking-wide transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'} hover:scale-105`}
            >
              Проєкти
            </a>
            <a
              href="/about"
              className={`nav-link text-xs font-medium uppercase tracking-wide transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'} hover:scale-105`}
            >
              Про бюро
            </a>
            <a
              href="/contact"
              className={`nav-link text-xs font-medium uppercase tracking-wide transition-all duration-300 ${isTransparent ? 'text-white/80 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'} hover:scale-105`}
            >
              Контакти
            </a>
          </nav>
          {isAuthenticated && (
            <div className="flex items-center gap-6 md:gap-8">
              <a
                href="/admin/posts"
                className={`hidden md:flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
                  isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
                } hover:scale-105`}
              >
                <Icon icon="solar:user-circle-linear" width={16} />
                <span>Адмін</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  navigate('/');
                }}
                className={`text-xs font-medium px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer ${
                  isTransparent
                    ? 'bg-white text-zinc-900 hover:bg-zinc-200 hover:shadow-zinc-900/20'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-zinc-900/20'
                }`}
              >
                Вийти
              </button>
            </div>
          )}
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          <div
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Мобільне меню"
            className={`absolute inset-0 bg-white flex flex-col ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}
            onAnimationEnd={handleAnimationEnd}
          >
            <div className="flex items-center justify-between px-6 h-20 border-b border-zinc-100">
              <a
                href="/"
                onClick={handleClose}
                className="text-lg font-medium tracking-tight uppercase text-zinc-900 hover:text-zinc-600"
              >
                Buro 710
              </a>
              <button
                onClick={handleClose}
                className="p-2 -mr-2 cursor-pointer"
                aria-label="Закрити меню"
              >
                <Icon icon="solar:close-circle-linear" width={24} className="text-zinc-900" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col items-center justify-center gap-8">
              <a
                href="/projects"
                onClick={handleClose}
                className="text-2xl font-medium text-zinc-900 hover:text-zinc-600"
              >
                Проєкти
              </a>
              <a
                href="/about"
                onClick={handleClose}
                className="text-2xl font-medium text-zinc-900 hover:text-zinc-600"
              >
                Про бюро
              </a>
              <a
                href="/contact"
                onClick={handleClose}
                className="text-2xl font-medium text-zinc-900 hover:text-zinc-600"
              >
                Контакти
              </a>
              {isAuthenticated && (
                <>
                  <a
                    href="/admin/posts"
                    onClick={handleClose}
                    className="text-lg text-zinc-500 hover:text-zinc-900"
                  >
                    Адмін панель
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      handleClose();
                      navigate('/');
                    }}
                    className="text-sm font-medium px-8 py-3 bg-zinc-900 text-white rounded-full cursor-pointer"
                  >
                    Вийти
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
