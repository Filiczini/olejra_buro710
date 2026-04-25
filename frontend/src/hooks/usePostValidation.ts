import { useState, useCallback } from 'react';
import { postCreateSchema } from '@buro710/shared';
import type { ZodIssue, ZodTypeAny } from 'zod';
import type { PostStatus } from '../types/post';
import type { PostHeroFormData } from '../components/admin/PostHeroForm';

export interface ValidationValues {
  title: string;
  slug: string;
  status: PostStatus;
  seoTitle: string;
  seoDescription: string;
  heroData: PostHeroFormData;
}

export function usePostValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateField = useCallback(
    (field: string, value: unknown) => {
      const shape = postCreateSchema.shape as Record<string, ZodTypeAny>;
      const fieldSchema = shape[field];
      if (!fieldSchema) return;
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          [field]: result.error.issues[0]?.message ?? 'Помилка',
        }));
      } else {
        clearFieldError(field);
      }
    },
    [clearFieldError]
  );

  const scrollToFirstError = useCallback(() => {
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>('.bg-red-50, .border-red-500, .text-red-500');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, []);

  const validate = useCallback(
    ({ title, slug, status, seoTitle, seoDescription, heroData }: ValidationValues): boolean => {
      const result = postCreateSchema.safeParse({
        title,
        slug,
        status,
        seo_title: seoTitle,
        seo_description: seoDescription,
        hero_title: heroData.hero_title,
        hero_subtitle: heroData.hero_subtitle,
        hero_tags: heroData.hero_tags,
        hero_location: heroData.hero_location,
        hero_year: heroData.hero_year,
      });

      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.issues.forEach((issue: ZodIssue) => {
          const field = issue.path[0] as string;
          if (field && !newErrors[field]) newErrors[field] = issue.message;
        });
        setErrors(newErrors);
        scrollToFirstError();
        return false;
      }

      setErrors({});
      return true;
    },
    [scrollToFirstError]
  );

  return { errors, setErrors, clearFieldError, validateField, validate, scrollToFirstError };
}
