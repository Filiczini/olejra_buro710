import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from './useToast';
import { usePostDraft } from './usePostDraft';
import { usePostFiles } from './usePostFiles';
import { usePostFormState } from './usePostFormState';
import { usePostValidation } from './usePostValidation';
import { usePostLoad } from './usePostLoad';
import { usePostSubmit } from './usePostSubmit';
import { usePostAutosave } from './usePostAutosave';
import type { BlockType, BlockData } from '@buro710/shared';
import type { EditBlock } from '../types/block';

export function usePostForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [initialBlocks, setInitialBlocks] = useState<EditBlock[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [pageBuilderKey, setPageBuilderKey] = useState(0);

  // Set once an unsaved draft gets its first server-side autosave — lets submit/
  // autosave target the right post without waiting for a route change.
  const [autosavedId, setAutosavedId] = useState<string | undefined>(undefined);
  const effectiveId = id || autosavedId;

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

  const { autosave } = usePostAutosave(effectiveId);

  const autosaveToServer = useCallback(async () => {
    const result = await autosave({
      title,
      slug,
      status,
      seoTitle,
      seoDescription,
      featured,
      heroData,
      ogImageFile,
      galleryImages,
      galleryNewFiles,
    });
    if (!result) return;

    if (!effectiveId) {
      // Sync the URL without a react-router navigation — a real navigate() would
      // update useParams and re-trigger usePostLoad, remounting PageBuilder
      // mid-edit. A plain history update just makes a refresh safe.
      setAutosavedId(result.id);
      window.history.replaceState(null, '', `/admin/posts/edit/${result.id}`);
    }

    // Drop already-uploaded Files so the next autosave doesn't re-upload them.
    setHeroData((prev) => ({
      ...prev,
      heroImage: undefined,
      hero_image_url: result.hero_image_url ?? prev.hero_image_url,
    }));
    setOgImageFile(null);
    setGalleryImages(result.gallery_images ?? []);
    setGalleryNewFiles([]);
  }, [
    autosave,
    title,
    slug,
    status,
    seoTitle,
    seoDescription,
    featured,
    heroData,
    ogImageFile,
    galleryImages,
    galleryNewFiles,
    effectiveId,
    setHeroData,
    setOgImageFile,
    setGalleryNewFiles,
  ]);

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

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
    setIsDirty(true);
  }, []);
  const clearDirty = useCallback(() => {
    isDirtyRef.current = false;
    setIsDirty(false);
  }, []);
  const getIsDirty = useCallback(() => isDirtyRef.current, []);

  // Always-fresh snapshot — updated each render so autosave never captures stale values
  const snapshotRef = useRef<() => Parameters<typeof draftSave>[0]>(null!);
  // eslint-disable-next-line react-hooks/refs
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
    const tid = setInterval(() => {
      draftSave(snapshotRef.current());
      autosaveToServer();
    }, 30000);
    return () => clearInterval(tid);
  }, [isDirty, draftSave, autosaveToServer]);

  useEffect(() => {
    const h = () => {
      if (isDirtyRef.current) {
        draftSave(snapshotRef.current());
        autosaveToServer();
      }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [draftSave, isDirtyRef, autosaveToServer]);

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
    setInitialBlocks(data.blocks);
    blocksDataRef.current = data.blocks;
    setGalleryImages(data.galleryImages);
    setPageBuilderKey((k) => k + 1);
    draftDismiss();
    markDirty();
  }, [applyFields, draftDataRef, draftDismiss, markDirty]);

  const { loading, load } = usePostLoad();

  useEffect(() => {
    if (id) {
      load(id, {
        applyFields,
        setInitialBlocks,
        setGalleryImages,
        setBlocksData: (blocks) => {
          blocksDataRef.current = blocks;
        },
        clearDirty,
        onLoaded: () => setPageBuilderKey((k) => k + 1),
      });
    }
  }, [id, load, applyFields, clearDirty]);

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
    [fileBlockImageChange, markDirty]
  );

  const { saving, submit } = usePostSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit(
      {
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
        isEditing: Boolean(effectiveId),
        id: effectiveId,
      },
      {
        validate,
        setErrors,
        scrollToFirstError,
        showToast,
        clearDirty,
        draftDismiss,
      }
    );
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
