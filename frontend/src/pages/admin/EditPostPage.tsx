import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SeoFields from '../../components/admin/SeoFields';
import PostHeroForm from '../../components/admin/PostHeroForm';
import PostHeroPreview from '../../components/admin/PostHeroPreview';
import PageBuilder from '../../components/admin/page-builder/PageBuilder';
import GalleryUploader from '../../components/admin/GalleryUploader';
import { usePostForm } from '../../hooks/usePostForm';

export default function EditPostPage() {
  const navigate = useNavigate();
  const {
    id,
    isEditing,
    loading,
    saving,
    title,
    slug,
    status,
    seoTitle,
    seoDescription,
    heroData,
    initialBlocks,
    galleryImages,
    galleryNewFiles,
    featured,
    errors,
    setSlug,
    setStatus,
    setSeoTitle,
    setSeoDescription,
    setOgImageFile,
    setHeroData,
    setGalleryImages,
    setGalleryNewFiles,
    setFeatured,
    handleTitleChange,
    handleBlocksChange,
    handleBlockImageChange,
    handleSubmit,
  } = usePostForm();

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

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setFeatured((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${featured ? 'bg-zinc-900' : 'bg-zinc-200'}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${featured ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </div>
            <span className="text-sm font-medium text-zinc-700">
              Вибраний пост{' '}
              <span className="text-zinc-400 font-normal">
                (відображається на головній, макс. 6)
              </span>
            </span>
          </label>
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
