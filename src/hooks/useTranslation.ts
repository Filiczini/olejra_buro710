import { useTranslation as useTranslationFromContext } from '../contexts/LanguageContext';

export function useTranslation() {
  return useTranslationFromContext();
}
