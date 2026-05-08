import { useEffect } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
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
    slugLocked,
    status,
    seoTitle,
    seoDescription,
    heroData,
    initialBlocks,
    galleryImages,
    galleryNewFiles,
    featured,
    errors,
    isDirty,
    draftBanner,
    pageBuilderKey,
    toast,
    dismissToast,
    markDirty,
    validateField,
    restoreDraft,
    dismissDraft,
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
  } = usePostForm();

  const blocker = useBlocker(getIsDirty);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

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

      {draftBanner && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Знайдено незбережену версію</span> від{' '}
            {new Date(draftBanner.savedAt).toLocaleTimeString('uk-UA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            . Відновити?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-3 py-1.5 text-sm font-medium bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Відновити
            </button>
            <button
              type="button"
              onClick={dismissDraft}
              className="px-3 py-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
            >
              Ігнорувати
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.submit}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <Input
            id="post-title"
            name="title"
            label="Назва сторінки"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={(e) => validateField('title', e.target.value)}
            error={errors.title}
            placeholder="Введіть назву сторінки"
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="post-slug" className="text-sm font-medium text-zinc-700">
                URL Slug
              </label>
              {slugLocked ? (
                <button
                  type="button"
                  onClick={handleSlugUnlock}
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                  title="Синхронізувати slug з назвою автоматично"
                >
                  <Icon icon="solar:link-broken-bold" width={12} />
                  Синхронізувати
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSlugLock}
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
                  title="Заблокувати slug і редагувати вручну"
                >
                  <Icon icon="solar:link-bold" width={12} />
                  Авто
                </button>
              )}
            </div>
            <input
              id="post-slug"
              name="slug"
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent ${
                errors.slug ? 'border-red-500' : 'border-zinc-200'
              }`}
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onBlur={(e) => validateField('slug', e.target.value)}
              placeholder="url-adresa-storinky"
            />
            {errors.slug && <span className="text-sm text-red-500">{errors.slug}</span>}
            {slug && (
              <p className="text-xs text-zinc-400">
                /page/<span className="font-medium text-zinc-500">{slug}</span>
              </p>
            )}
          </div>

          <div>
            <p className="block text-sm font-medium text-zinc-700 mb-2">Статус</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => {
                    setStatus('draft');
                    markDirty();
                  }}
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
                  onChange={() => {
                    setStatus('published');
                    markDirty();
                  }}
                  className="w-4 h-4 text-zinc-900"
                />
                <span className="text-zinc-700">Опубліковано</span>
              </label>
            </div>
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              setFeatured((v) => !v);
              markDirty();
            }}
          >
            <div
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PostHeroForm
              data={heroData}
              onChange={(data) => {
                setHeroData(data);
                markDirty();
              }}
              errors={errors}
              onBlurField={validateField}
            />
          </div>
          <div className="lg:col-span-2">
            <PostHeroPreview data={heroData} />
          </div>
        </div>

        <SeoFields
          seoTitle={seoTitle}
          seoDescription={seoDescription}
          onSeoTitleChange={(v) => {
            setSeoTitle(v);
            markDirty();
          }}
          onSeoDescriptionChange={(v) => {
            setSeoDescription(v);
            markDirty();
          }}
          onOgImageChange={(f) => {
            setOgImageFile(f);
            markDirty();
          }}
          onBlurField={validateField}
          errors={{ seo_title: errors.seo_title, seo_description: errors.seo_description }}
        />

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-medium text-zinc-900 mb-4">Блоки контенту</h2>
          <PageBuilder
            key={`${id || 'new'}-${pageBuilderKey}`}
            initialBlocks={initialBlocks}
            onChange={handleBlocksChange}
            onImageChange={handleBlockImageChange}
          />
        </div>

        <GalleryUploader
          images={galleryImages}
          onImagesChange={(imgs) => {
            setGalleryImages(imgs);
            markDirty();
          }}
          newFiles={galleryNewFiles}
          onNewFilesChange={(files) => {
            setGalleryNewFiles(files);
            markDirty();
          }}
        />

        {(errors.submit || Object.keys(errors).some((k) => k !== 'submit')) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit || 'Виправте помилки у формі перед збереженням'}
          </div>
        )}

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/posts')}>
            Скасувати
          </Button>
          <Button type="submit" disabled={saving} className="flex items-center gap-2">
            {saving && <Icon icon="solar:spinner-linear" width={16} className="animate-spin" />}
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </form>

      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}

      <Modal
        isOpen={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="Незбережені зміни"
      >
        <p className="text-sm text-zinc-500 leading-relaxed mb-6">
          Ви маєте незбережені зміни. Якщо вийдете зараз — вони будуть втрачені.
        </p>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => blocker.reset?.()}>
            Залишитися
          </Button>
          <Button type="button" onClick={() => blocker.proceed?.()}>
            Вийти без збереження
          </Button>
        </div>
      </Modal>
    </div>
  );
}
