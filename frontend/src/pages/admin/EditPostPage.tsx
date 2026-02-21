import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '../../lib/logger';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { postService } from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SeoFields from '../../components/admin/SeoFields';
import PostHeroForm, { type PostHeroFormData } from '../../components/admin/PostHeroForm';
import PostHeroPreview from '../../components/admin/PostHeroPreview';
import PageBuilder from '../../components/admin/page-builder/PageBuilder';
import GalleryUploader from '../../components/admin/GalleryUploader';
import type { PostStatus } from '../../types/post';
import type { Block, BlockType, BlockData, EditBlock } from '../../types/block';

interface BlockWithFile {
  id: string;
  file: File | null;
}

interface BlocksDataRef {
  blocks: EditBlock[];
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

export default function EditPostPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [heroData, setHeroData] = useState<PostHeroFormData>(INITIAL_HERO_DATA);
  const [initialBlocks, setInitialBlocks] = useState<Block[]>([]);
  const [blockFiles, setBlockFiles] = useState<BlockWithFile[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const blocksDataRef = useRef<BlocksDataRef>({ blocks: [] });

  const loadPost = useCallback(
    async (postId: string) => {
      setLoading(true);
      try {
        const result = await postService.getById(postId);
        const { post, blocks: loadedBlocks } = result;

        setTitle(post.title);
        setSlug(post.slug);
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

        setGalleryImages(post.gallery_images || []);

        blocksDataRef.current.blocks = loadedBlocks.map((b, index) => ({
          id: b.id,
          type: b.type,
          data: b.data,
          sort_order: index,
        }));
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

  const generateSlug = (titleValue: string) => {
    const transliterate = (str: string): string => {
      const map: Record<string, string> = {
        а: 'a',
        б: 'b',
        в: 'v',
        г: 'h',
        ґ: 'g',
        д: 'd',
        е: 'e',
        є: 'ye',
        ж: 'zh',
        з: 'z',
        и: 'y',
        і: 'i',
        ї: 'yi',
        й: 'y',
        к: 'k',
        л: 'l',
        м: 'm',
        н: 'n',
        о: 'o',
        п: 'p',
        р: 'r',
        с: 's',
        т: 't',
        у: 'u',
        ф: 'f',
        х: 'kh',
        ц: 'ts',
        ч: 'ch',
        ш: 'sh',
        щ: 'shch',
        ь: '',
        ю: 'yu',
        я: 'ya',
      };
      return str
        .toLowerCase()
        .split('')
        .map((char) => map[char] || char)
        .join('');
    };

    return transliterate(titleValue)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleBlocksChange = (
    updatedBlocks: { id?: string; type: BlockType; data: BlockData; sort_order: number }[]
  ) => {
    blocksDataRef.current.blocks = updatedBlocks;
  };

  const handleBlockImageChange = (blockId: string, file: File | null) => {
    setBlockFiles((prev) => {
      const existing = prev.find((bf) => bf.id === blockId);
      if (existing) {
        return prev.map((bf) => (bf.id === blockId ? { ...bf, file } : bf));
      }
      return [...prev, { id: blockId, file }];
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Назва обов'язкова";
    }

    if (!slug.trim()) {
      newErrors.slug = "Slug обов'язковий";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Slug може містити лише латинські літери, цифри та дефіси';
    }

    if (seoTitle && seoTitle.length > 60) {
      newErrors.seo_title = 'SEO title не може бути довшим за 60 символів';
    }

    if (seoDescription && seoDescription.length > 160) {
      newErrors.seo_description = 'SEO description не може бути довшим за 160 символів';
    }

    if (heroData.hero_title && heroData.hero_title.length > 200) {
      newErrors.hero_title = 'Hero title не може бути довшим за 200 символів';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      formData.append('hero_title', heroData.hero_title || '');
      formData.append('hero_subtitle', heroData.hero_subtitle || '');
      formData.append('hero_tags', JSON.stringify(heroData.hero_tags || []));
      formData.append('hero_location', heroData.hero_location || '');
      formData.append('hero_year', heroData.hero_year || '');

      if (heroData.heroImage) {
        formData.append('heroImage', heroData.heroImage);
      }

      const blocksData = blocksDataRef.current.blocks.map((block) => {
        const blockId = block.id || block._tempId;
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

      const imageBlocks = blockFiles.filter((bf) => bf.file);
      imageBlocks.forEach((bf) => {
        if (bf.file) {
          formData.append('blockImages', bf.file);
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

      navigate('/admin/posts');
    } catch (error) {
      console.error('Error saving post:', error);
      setErrors({ submit: 'Помилка збереження посту' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon icon="solar:spinner-linear" width={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          {isEditing ? 'Редагувати сторінку' : 'Нова сторінка'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.submit}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <Input
            label="Назва сторінки"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
            placeholder="Введіть назву сторінки"
          />

          <Input
            label="URL Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            error={errors.slug}
            placeholder="url-adresa-storinky"
          />

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Статус</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="w-4 h-4 text-zinc-900"
                />
                <span className="text-zinc-700">Чернетка</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="w-4 h-4 text-zinc-900"
                />
                <span className="text-zinc-700">Опубліковано</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PostHeroForm data={heroData} onChange={setHeroData} errors={errors} />
          </div>
          <div className="lg:col-span-2">
            <PostHeroPreview data={heroData} />
          </div>
        </div>

        <SeoFields
          seoTitle={seoTitle}
          seoDescription={seoDescription}
          onSeoTitleChange={setSeoTitle}
          onSeoDescriptionChange={setSeoDescription}
          onOgImageChange={setOgImageFile}
          errors={{ seo_title: errors.seo_title, seo_description: errors.seo_description }}
        />

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-medium text-zinc-900 mb-4">Блоки контенту</h2>
          <PageBuilder
            key={`${id || 'new'}-${initialBlocks.length}`}
            initialBlocks={initialBlocks}
            onChange={handleBlocksChange}
            onImageChange={handleBlockImageChange}
          />
        </div>

        <GalleryUploader
          images={galleryImages}
          onImagesChange={setGalleryImages}
          newFiles={galleryNewFiles}
          onNewFilesChange={setGalleryNewFiles}
        />

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/posts')}>
            Скасувати
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </form>
    </div>
  );
}
