import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../lib/logger';
import { postService } from '../services/api';
import { buildPostFormData } from '../lib/buildPostFormData';
import type { ValidationValues } from './usePostValidation';
import type { PostStatus } from '@buro710/shared';
import type { EditBlock } from '../types/block';
import type { PostHeroFormData } from '../components/admin/PostHeroForm';
import type { ApiError } from '../types/api';

interface BlockWithFile {
  id: string;
  file: File | null;
}

export interface SubmitValues {
  title: string;
  slug: string;
  status: PostStatus;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  heroData: PostHeroFormData;
  ogImageFile: File | null;
  blocksData: EditBlock[];
  blockFiles: BlockWithFile[];
  galleryImages: string[];
  galleryNewFiles: File[];
  isEditing: boolean;
  id?: string;
}

export interface SubmitCallbacks {
  validate: (values: ValidationValues) => boolean;
  setErrors: (errors: Record<string, string>) => void;
  scrollToFirstError: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  clearDirty: () => void;
  draftDismiss: () => void;
}

export function usePostSubmit() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const submit = useCallback(
    async (values: SubmitValues, callbacks: SubmitCallbacks) => {
      const {
        title,
        slug,
        status,
        seoTitle,
        seoDescription,
        featured,
        heroData,
        ogImageFile,
        blocksData,
        blockFiles,
        galleryImages,
        galleryNewFiles,
        isEditing,
        id,
      } = values;

      if (
        !callbacks.validate({
          title,
          slug,
          status,
          seoTitle,
          seoDescription,
          heroData,
        })
      ) {
        return;
      }

      setSaving(true);
      try {
        const formData = buildPostFormData({
          title,
          slug,
          status,
          seoTitle,
          seoDescription,
          featured,
          heroData,
          ogImageFile,
          blocksData,
          blockFiles,
          galleryImages,
          galleryNewFiles,
        });
        if (isEditing && id) {
          await postService.update(id, formData);
        } else {
          await postService.create(formData);
        }
        callbacks.clearDirty();
        callbacks.draftDismiss();
        navigate('/admin/posts', { state: { saved: true } });
      } catch (error) {
        logger.error('Error saving post:', error);
        callbacks.showToast('Помилка збереження', 'error');
        const data = (error as ApiError)?.response?.data;
        if (data?.details?.length) {
          const fe: Record<string, string> = {};
          data.details.forEach(({ field, message }) => {
            if (field && !fe[field]) fe[field] = message;
          });
          callbacks.setErrors(fe);
        } else if (data?.field && data?.error) {
          callbacks.setErrors({
            [data.field]:
              data.field === 'slug' && data.error === 'Slug already exists'
                ? 'Такий URL вже існує'
                : data.error,
          });
        } else {
          callbacks.setErrors({ submit: 'Помилка збереження посту' });
        }
        callbacks.scrollToFirstError();
      } finally {
        setSaving(false);
      }
    },
    [navigate]
  );

  return { saving, submit };
}
