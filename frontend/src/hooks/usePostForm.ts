import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { logger } from '../lib/logger';
import { postService } from '../services/api';
import type { Block, BlockType, BlockData } from '@buro710/shared';
import type { EditBlock } from '../types/block';
import { useToast } from './useToast';
import { usePostDraft } from './usePostDraft';
import { usePostFiles } from './usePostFiles';
import { usePostFormState } from './usePostFormState';
import { usePostValidation } from './usePostValidation';
import { buildPostFormData } from '../lib/buildPostFormData';

export function usePostForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialBlocks, setInitialBlocks] = useState<Block[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [pageBuilderKey, setPageBuilderKey] = useState(0);

  const { toast, showToast, dismissToast } = useToast();

  const state = usePostFormState(isEditing);
  const {
    title,
    slug,
    slugLocked,
    status,
    seoTitle,
    seoDescription,
    heroData,
    featured,
    setStatus,
    setSeoTitle,
    setSeoDescription,
    setHeroData,
    setFeatured,
    updateTitle,
    updateSlug,
    unlockSlug,
    lockSlug,
    applyFields,
  } = state;

  const validation = usePostValidation();
  const { errors, setErrors, clearFieldError, validateField, validate, scrollToFirstError } =
    validation;

  const files = usePostFiles();
  const {
    ogImageFile,
    setOgImageFile,
    blockFiles,
    galleryNewFiles,
    setGalleryNewFiles,
    handleBlockImageChange: fileBlockImageChange,
  } = files;

  const draft = usePostDraft(`draft:${id || 'new'}`);
  const {
    banner: draftBanner,
    dataRef: draftDataRef,
    save: draftSave,
    dismiss: draftDismiss,
  } = draft;

  const isDirtyRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);
  const blocksDataRef = useRef<EditBlock[]>([]);

  const markDirty = () => {
    isDirtyRef.current = true;
    setIsDirty(true);
  };
  const clearDirty = () => {
    isDirtyRef.current = false;
    setIsDirty(false);
  };
  const getIsDirty = useCallback(() => isDirtyRef.current, []);

  // Always-fresh snapshot — updated each render so autosave never captures stale values
  const snapshotRef = useRef<() => Parameters<typeof draftSave>[0]>(null!);
  snapshotRef.current = () => ({
    title,
    slug,
    slugLocked,
    status,
    seoTitle,
    seoDescription,
    featured,
    heroData: {
      hero_image_url: heroData.hero_image_url || '',
      hero_title: heroData.hero_title || '',
      hero_subtitle: heroData.hero_subtitle || '',
      hero_tags: heroData.hero_tags || [],
      hero_location: heroData.hero_location || '',
      hero_year: heroData.hero_year || '',
    },
    blocks: blocksDataRef.current,
    galleryImages,
  });

  useEffect(() => {
    if (!isDirty) return;
    const tid = setInterval(() => draftSave(snapshotRef.current()), 30000);
    return () => clearInterval(tid);
  }, [isDirty, draftSave]);

  useEffect(() => {
    const h = () => {
      if (isDirtyRef.current) draftSave(snapshotRef.current());
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [draftSave]);

  const restoreDraft = useCallback(() => {
    const data = draftDataRef.current;
    if (!data) return;
    applyFields({
      title: data.title,
      slug: data.slug,
      slugLocked: data.slugLocked,
      status: data.status,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      featured: data.featured,
      heroData: { ...data.heroData, heroImage: undefined },
    });
    setInitialBlocks(data.blocks as unknown as Block[]);
    blocksDataRef.current = data.blocks;
    setGalleryImages(data.galleryImages);
    setPageBuilderKey((k) => k + 1);
    draftDismiss();
    markDirty();
  }, [applyFields, draftDataRef, draftDismiss]);

  const loadPost = useCallback(
    async (postId: string) => {
      setLoading(true);
      try {
        const { post, blocks: lb } = await postService.getById(postId);
        applyFields({
          title: post.title,
          slug: post.slug,
          slugLocked: true,
          status: post.status,
          seoTitle: post.seo_title || '',
          seoDescription: post.seo_description || '',
          featured: post.featured || false,
          heroData: {
            hero_image_url: post.hero_image_url || '',
            hero_title: post.hero_title || '',
            hero_subtitle: post.hero_subtitle || '',
            hero_tags: post.hero_tags || [],
            hero_location: post.hero_location || '',
            hero_year: post.hero_year || '',
            heroImage: undefined,
          },
        });
        setInitialBlocks(lb);
        setGalleryImages(post.gallery_images || []);
        blocksDataRef.current = lb.map((b, i) => ({
          id: b.id,
          type: b.type,
          data: b.data,
          sort_order: i,
        }));
        clearDirty();
      } catch (error) {
        logger.error('Error loading post', error);
        navigate('/admin/posts');
      } finally {
        setLoading(false);
      }
    },
    [navigate, applyFields]
  );

  useEffect(() => {
    if (id) loadPost(id);
  }, [id, loadPost]);

  const handleTitleChange = (value: string) => {
    updateTitle(value);
    markDirty();
    clearFieldError('title');
  };
  const handleSlugChange = (value: string) => {
    updateSlug(value);
    markDirty();
    clearFieldError('slug');
  };
  const handleSlugUnlock = () => {
    unlockSlug();
    markDirty();
  };
  const handleSlugLock = () => lockSlug();
  const handleBlocksChange = (
    updatedBlocks: { id?: string; type: BlockType; data: BlockData; sort_order: number }[]
  ) => {
    blocksDataRef.current = updatedBlocks;
    markDirty();
  };

  const handleBlockImageChange = useCallback(
    (blockId: string, file: File | null, field?: string) => {
      fileBlockImageChange(blockId, file, field);
      markDirty();
    },
    [fileBlockImageChange]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate({ title, slug, status, seoTitle, seoDescription, heroData })) return;

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
        blocksData: blocksDataRef.current,
        blockFiles,
        galleryImages,
        galleryNewFiles,
      });
      if (isEditing && id) {
        await postService.update(id, formData);
      } else {
        await postService.create(formData);
      }
      clearDirty();
      draftDismiss();
      navigate('/admin/posts', { state: { saved: true } });
    } catch (error) {
      logger.error('Error saving post:', error);
      showToast('Помилка збереження', 'error');
      const data = (
        error as {
          response?: {
            data?: {
              error?: string;
              field?: string;
              details?: { field: string; message: string }[];
            };
          };
        }
      )?.response?.data;
      if (data?.details?.length) {
        const fe: Record<string, string> = {};
        data.details.forEach(({ field, message }) => {
          if (field && !fe[field]) fe[field] = message;
        });
        setErrors(fe);
      } else if (data?.field && data?.error) {
        setErrors({
          [data.field]:
            data.field === 'slug' && data.error === 'Slug already exists'
              ? 'Такий URL вже існує'
              : data.error,
        });
      } else {
        setErrors({ submit: 'Помилка збереження посту' });
      }
      scrollToFirstError();
    } finally {
      setSaving(false);
    }
  };

  return {
    id,
    isEditing,
    title,
    slug,
    slugLocked,
    status,
    featured,
    initialBlocks,
    pageBuilderKey,
    markDirty,
    validateField,
    setStatus,
    setFeatured,
    handleTitleChange,
    handleSlugChange,
    handleSlugUnlock,
    handleSlugLock,
    handleBlocksChange,
    handleBlockImageChange,

    heroProps: {
      data: heroData,
      onChange: (data: typeof heroData) => {
        setHeroData(data);
        markDirty();
      },
      errors,
      onBlurField: validateField,
    },

    seoProps: {
      seoTitle,
      seoDescription,
      onSeoTitleChange: (v: string) => {
        setSeoTitle(v);
        markDirty();
      },
      onSeoDescriptionChange: (v: string) => {
        setSeoDescription(v);
        markDirty();
      },
      onOgImageChange: (f: File | null) => {
        setOgImageFile(f);
        markDirty();
      },
      onBlurField: validateField,
      errors: {
        seo_title: errors.seo_title,
        seo_description: errors.seo_description,
      },
    },

    galleryProps: {
      images: galleryImages,
      onImagesChange: (imgs: string[]) => {
        setGalleryImages(imgs);
        markDirty();
      },
      newFiles: galleryNewFiles,
      onNewFilesChange: (files: File[]) => {
        setGalleryNewFiles(files);
        markDirty();
      },
    },

    formState: {
      loading,
      saving,
      errors,
      isDirty,
      toast,
      dismissToast,
      draftBanner,
      getIsDirty,
      restoreDraft,
      dismissDraft: draftDismiss,
      handleSubmit,
    },
  };
}
