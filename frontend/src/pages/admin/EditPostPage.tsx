import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import Input from '../../components/ui/Input';
import SeoFields from '../../components/admin/SeoFields';
import PostHeroForm from '../../components/admin/PostHeroForm';
import PostHeroPreview from '../../components/admin/PostHeroPreview';
import PageBuilder from '../../components/admin/page-builder/PageBuilder';
import GalleryUploader from '../../components/admin/GalleryUploader';
import PostEditorShell from '../../components/admin/PostEditorShell';
import { usePostForm } from '../../hooks/usePostForm';

export default function EditPostPage() {
  const navigate = useNavigate();
  const {
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
    heroProps,
    seoProps,
    galleryProps,
    formState,
  } = usePostForm();

  return (
    <PostEditorShell
      isEditing={isEditing}
      loading={formState.loading}
      saving={formState.saving}
      errors={formState.errors}
      toast={formState.toast}
      draftBanner={formState.draftBanner}
      isDirty={formState.isDirty}
      getIsDirty={formState.getIsDirty}
      restoreDraft={formState.restoreDraft}
      dismissDraft={formState.dismissDraft}
      dismissToast={formState.dismissToast}
      handleSubmit={formState.handleSubmit}
      onCancel={() => navigate('/admin/posts')}
    >
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <Input
          id="post-title"
          name="title"
          label="Назва сторінки"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={(e) => validateField('title', e.target.value)}
          error={formState.errors.title}
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
              formState.errors.slug ? 'border-red-500' : 'border-zinc-200'
            }`}
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            onBlur={(e) => validateField('slug', e.target.value)}
            placeholder="url-adresa-storinky"
          />
          {formState.errors.slug && (
            <span className="text-sm text-red-500">{formState.errors.slug}</span>
          )}
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

        <button
          type="button"
          role="switch"
          aria-checked={featured}
          onClick={() => {
            setFeatured((v) => !v);
            markDirty();
          }}
          className="flex items-center gap-3 cursor-pointer select-none bg-transparent border-0 p-0 text-left"
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
            <span className="text-zinc-400 font-normal">(відображається на головній, макс. 6)</span>
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PostHeroForm {...heroProps} />
        </div>
        <div className="lg:col-span-2">
          <PostHeroPreview data={heroProps.data} title={title} />
        </div>
      </div>

      <SeoFields {...seoProps} />

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-medium text-zinc-900 mb-4">Блоки контенту</h2>
        <PageBuilder
          key={`${id || 'new'}-${pageBuilderKey}`}
          initialBlocks={initialBlocks}
          onChange={handleBlocksChange}
          onImageChange={handleBlockImageChange}
        />
      </div>

      <GalleryUploader {...galleryProps} />
    </PostEditorShell>
  );
}
