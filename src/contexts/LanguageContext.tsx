import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { translations, type Locale, type Translations } from '../i18n';

// Re-export Locale as Language for backward compatibility
export type Language = Locale;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'buro710-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (saved === 'uk' || saved === 'en') ? saved : 'uk';
  });

  const toggleLanguage = () => {
    setLanguageState(prev => {
      const newLang = prev === 'uk' ? 'en' : 'uk';
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      return newLang;
    });
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

/**
 * Hook to get translations for the current language with fallback support
 * @returns Translations object with fallback to key name for missing translations
 */
export function useTranslation(): Translations {
  const { language } = useLanguage();

  return useMemo(() => {
    const t = translations[language];

    // Create proxy with fallback for missing translation keys
    return new Proxy(t, {
      get(target, prop) {
        if (prop in target) {
          return target[prop as keyof Translations];
        }
        // Fallback: return key name as string and warn in development
        console.warn(`[i18n] Missing translation key: ${String(prop)} in locale: ${language}`);
        return String(prop);
      }
    }) as Translations;
  }, [language]);
}

