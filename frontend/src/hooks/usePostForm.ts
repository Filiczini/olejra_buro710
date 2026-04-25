import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { logger } from '../lib/logger';
import { postCreateSchema } from '@buro710/shared';
import { generateSlug } from '@buro710/shared';
import type { ZodIssue } from 'zod';
import { postService } from '../services/api';
import type { PostHeroFormData } from '../components/admin/PostHeroForm';
import type { PostStatus } from '../types/post';
import type { Block, BlockType, BlockData, EditBlock } from '../types/block';
import { useToast } from './useToast';

interface BlockWithFile {
  id: string;
  file: File | null;
}

const INITIAL_HERO_DATA: PostHeroFormData = {
  hero_image_url: '',
  hero_title: '',
  hero_subtitle: '',
  hero_tags: [],
  hero_location: '',
  hero_year: '',
  heroImage: undefined,
};

export function usePostForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugLocked, setSlugLocked] = useState(isEditing);
  const [status, setStatus] = useState<PostStatus>('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [heroData, setHeroData] = useState<PostHeroFormData>(INITIAL_HERO_DATA);
  const [initialBlocks, setInitialBlocks] = useState<Block[]>([]);
  const [blockFiles, setBlockFiles] = useState<BlockWithFile[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);
  const [featured, setFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast, showToast, dismissToast } = useToast();

  const isDirtyRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => {
    isDirtyRef.current = true;
    setIsDirty(true);
  };

  const clearDirty = () => {
    isDirtyRef.current = false;
    setIsDirty(false);
  };

  // Stable callback for useBlocker — reads ref synchronously at navigation time,
  // avoiding stale closure issues when clearDirty() is called just before navigate().
  const getIsDirty = useCallback(() => isDirtyRef.current, []);

  const blocksDataRef = useRef<EditBlock[]>([]);

  const loadPost = useCallback(
    async (postId: string) => {
      setLoading(true);
      try {
        const result = await postService.getById(postId);
        const { post, blocks: loadedBlocks } = result;

        setTitle(post.title);
        setSlug(post.slug);
        setSlugLocked(true);
        setStatus(post.status);
        setSeoTitle(post.seo_title || '');
        setSeoDescription(post.seo_description || '');
        setInitialBlocks(loadedBlocks);

        setHeroData({
          hero_image_url: post.hero_image_url || '',
          hero_title: post.hero_title || '',
          hero_subtitle: post.hero_subtitle || '',
          hero_tags: post.hero_tags || [],
          hero_location: post.hero_location || '',
          hero_year: post.hero_year || '',
          heroImage: undefined,
        });

        setFeatured(post.featured || false);
        setGalleryImages(post.gallery_images || []);

        blocksDataRef.current = loadedBlocks.map((b, index) => ({
          id: b.id,
          type: b.type,
          data: b.data,
          sort_order: index,
        }));

        clearDirty();
      } catch (error) {
        logger.error('Error loading post', error);
        navigate('/admin/posts');
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id, loadPost]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    markDirty();
    if (!slugLocked) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugLocked(true);
    markDirty();
  };

  const handleSlugUnlock = () => {
    setSlugLocked(false);
    setSlug(generateSlug(title));
    markDirty();
  };

  const handleSlugLock = () => {
    setSlugLocked(true);
  };

  const handleBlocksChange = (
    updatedBlocks: { id?: string; type: BlockType; data: BlockData; sort_order: number }[]
  ) => {
    blocksDataRef.current = updatedBlocks;
    markDirty();
  };

  const handleBlockImageChange = (blockId: string, file: File | null, field?: string) => {
    const key = field ? `${blockId}__${field}` : blockId;
    setBlockFiles((prev) => {
      const existing = prev.find((bf) => bf.id === key);
      if (existing) {
        return prev.map((bf) => (bf.id === key ? { ...bf, file } : bf));
      }
      return [...prev, { id: key, file }];
    });
    markDirty();
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>('.bg-red-50, .border-red-500, .text-red-500');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const validate = (): boolean => {
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
        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      scrollToFirstError();
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('slug', slug);
      formData.append('status', status);
      formData.append('seo_title', seoTitle);
      formData.append('seo_description', seoDescription);

      formData.append('featured', String(featured));
      formData.append('hero_title', heroData.hero_title || '');
      formData.append('hero_subtitle', heroData.hero_subtitle || '');
      formData.append('hero_tags', JSON.stringify(heroData.hero_tags || []));
      formData.append('hero_location', heroData.hero_location || '');
      formData.append('hero_year', heroData.hero_year || '');

      if (heroData.heroImage) {
        formData.append('heroImage', heroData.heroImage);
      }

      const blocksData = blocksDataRef.current.map((block) => {
        const blockId = block.id || block._tempId;

        if (block.type === 'three_images') {
          const newImageSlots: number[] = [];
          for (let i = 0; i < 3; i++) {
            const key = `${blockId}__images.${i}`;
            const bf = blockFiles.find((f) => f.id === key);
            if (bf?.file) newImageSlots.push(i);
          }
          return {
            id: block.id?.startsWith('temp-') ? undefined : block.id,
            _tempId: block._tempId,
            type: block.type,
            data: {
              ...block.data,
              _newImageSlots: newImageSlots.length > 0 ? newImageSlots : undefined,
            },
            sort_order: block.sort_order,
          };
        }

        const blockFile = blockFiles.find((bf) => bf.id === blockId);
        return {
          id: block.id?.startsWith('temp-') ? undefined : block.id,
          _tempId: block._tempId,
          type: block.type,
          data: {
            ...block.data,
            _hasNewImage: !!blockFile?.file,
          },
          sort_order: block.sort_order,
        };
      });
      formData.append('blocks', JSON.stringify(blocksData));

      if (ogImageFile) {
        formData.append('ogImage', ogImageFile);
      }

      blocksDataRef.current.forEach((block) => {
        const blockId = block.id || block._tempId;
        if (block.type === 'three_images') {
          for (let i = 0; i < 3; i++) {
            const key = `${blockId}__images.${i}`;
            const bf = blockFiles.find((f) => f.id === key);
            if (bf?.file) formData.append('blockImages', bf.file);
          }
        } else {
          const bf = blockFiles.find((f) => f.id === blockId);
          if (bf?.file) formData.append('blockImages', bf.file);
        }
      });

      formData.append('gallery_images', JSON.stringify(galleryImages));

      galleryNewFiles.forEach((file) => {
        formData.append('galleryImages', file);
      });

      if (isEditing && id) {
        await postService.update(id, formData);
      } else {
        await postService.create(formData);
      }

      clearDirty();
      showToast('Пост збережено', 'success');
      setTimeout(() => navigate('/admin/posts'), 1500);
    } catch (error) {
      logger.error('Error saving post:', error);
      showToast('Помилка збереження', 'error');
      const apiError = error as {
        response?: {
          data?: {
            error?: string;
            field?: string;
            details?: { field: string; message: string }[];
          };
        };
      };
      const data = apiError?.response?.data;

      if (data?.details && data.details.length > 0) {
        const fieldErrors: Record<string, string> = {};
        data.details.forEach(({ field, message }) => {
          if (field && !fieldErrors[field]) fieldErrors[field] = message;
        });
        setErrors(fieldErrors);
      } else if (data?.field && data?.error) {
        const message =
          data.field === 'slug' && data.error === 'Slug already exists'
            ? 'Такий URL вже існує'
            : data.error;
        setErrors({ [data.field]: message });
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
    loading,
    saving,
    title,
    slug,
    slugLocked,
    status,
    seoTitle,
    seoDescription,
    ogImageFile,
    heroData,
    initialBlocks,
    galleryImages,
    galleryNewFiles,
    featured,
    errors,
    isDirty,
    toast,
    dismissToast,
    markDirty,
    getIsDirty,
    setStatus,
    setSeoTitle,
    setSeoDescription,
    setOgImageFile,
    setHeroData,
    setGalleryImages,
    setGalleryNewFiles,
    setFeatured,
    handleTitleChange,
    handleSlugChange,
    handleSlugUnlock,
    handleSlugLock,
    handleBlocksChange,
    handleBlockImageChange,
    handleSubmit,
  };
}
