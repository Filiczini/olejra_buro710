import Input from '../ui/Input';
import TagInput from './TagInput';
import MultiImageUpload from './MultiImageUpload';
import SingleImageUpload from './SingleImageUpload';
import DragDropMediaList from './DragDropMediaList';
import type { Media } from '../../types/project';

interface BaseProps {
  formData: {
    title?: string;
    description?: string;
    tags?: string[];
    location?: string;
    area?: string;
    year?: string;
    team?: string;
    architects?: string;
    concept_heading?: string;
    concept_caption?: string;
    concept_quote?: string;
    short_description?: string;
    category?: string;
    subtitle?: string;
    photo_credits?: string;
    challenge_title?: string;
    materials_title?: string;
    context_title?: string;
    figure_number?: string;
    figure_caption?: string;
    challenge_description?: string;
    quote_text?: string;
    context_description?: string;
    next_project_link_title?: string;
    next_project_link_subtitle?: string;
    other_projects_title?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
}

interface CreateProps extends BaseProps {
  mode: 'create';
  heroMedia: File | undefined;
  setHeroMedia: (media: File | undefined) => void;
  galleryMedia: File[];
  setGalleryMedia: (media: File[]) => void;
}

interface EditProps extends BaseProps {
  mode: 'edit';
  heroMedia: Media[];
  setHeroMedia: (media: Media[]) => void;
  heroImageToUpload: File | undefined;
  setHeroImageToUpload: (file: File | undefined) => void;
  galleryMedia: Media[];
  setGalleryMedia: (media: Media[]) => void;
  galleryImagesToUpload: File[];
  setGalleryImagesToUpload: (files: File[]) => void;
  onHeroMediaRemove: () => void;
  onGalleryMediaReorder: (items: Media[]) => void;
  onGalleryMediaRemove: (id: string) => void;
  onGalleryMediaAltTextChange: (id: string, alt: string) => void;
}

type ProjectFormProps = CreateProps | EditProps;

export default function ProjectForm(props: ProjectFormProps) {
  const { formData, setFormData, errors, mode } = props;
  const isEditMode = mode === 'edit';

  const renderHeroImageSection = () => (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        Головне зображення
      </h2>
      <div className="mb-4">
        <p className="text-sm text-zinc-600">Додайте головне зображення.</p>
      </div>

      {isEditMode && (props as EditProps).heroMedia.length > 0 && (
        <div className="mb-4">
          <div className="relative aspect-video w-full max-w-lg bg-zinc-100 rounded-lg overflow-hidden">
            <img
              src={(props as EditProps).heroMedia[0].url}
              alt="Current hero image"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(props as EditProps).onHeroMediaRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {!isEditMode && (
        <SingleImageUpload
          image={(props as CreateProps).heroMedia}
          onImageChange={(img) => (props as CreateProps).setHeroMedia(img || undefined)}
          label="Головне зображення"
          placeholder="Перетягніть головне зображення або перегляньте"
          error={errors.heroMedia}
        />
      )}

      {isEditMode && (
        <SingleImageUpload
          image={(props as EditProps).heroImageToUpload}
          onImageChange={(img) => (props as EditProps).setHeroImageToUpload(img || undefined)}
          label="Додати головне зображення"
          placeholder="Перетягніть головне зображення або перегляньте"
        />
      )}
    </section>
  );

  const renderMainInfoSection = () => (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        Основна інформація
      </h2>
      <div className="flex flex-col gap-6">
        <Input
          label="Назва"
          placeholder="Введіть назву проєкту"
          value={formData.title || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          required
        />

        <Input
          label="Короткий опис"
          placeholder="Короткий опис проекту"
          value={formData.short_description || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, short_description: e.target.value })}
        />

        <Input
          label="Категорія"
          placeholder="Категорія проекту"
          value={formData.category || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, category: e.target.value })}
        />

        <Input
          label="Підзаголовок"
          placeholder="Підзаголовок проекту"
          value={formData.subtitle || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subtitle: e.target.value })}
        />

        <Input
          label="Фотограф"
          placeholder="Ім'я фотографа"
          value={formData.photo_credits || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, photo_credits: e.target.value })}
        />

        <TagInput
          tags={formData.tags || []}
          onTagsChange={(tags) => setFormData({ ...formData, tags })}
        />
        {errors.tags && <span className="text-sm text-red-500">{errors.tags}</span>}

        <Input
          label="Локація"
          placeholder="Введіть локацію"
          value={formData.location || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
        />

        <Input
          label="Площа (м²)"
          placeholder="Введіть площу"
          value={formData.area || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, area: e.target.value })}
        />

        <Input
          label="Рік"
          placeholder="Введіть рік"
          value={formData.year || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, year: e.target.value })}
        />

        <Input
          label="Команда"
          placeholder="Введіть учасників команди"
          value={formData.team || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, team: e.target.value })}
        />

        <Input
          label="Архітектори"
          placeholder="Введіть назву архітектора або бюро"
          value={formData.architects || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, architects: e.target.value })}
        />
      </div>
    </section>
  );

  const renderDescriptionSection = () => (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        Опис
      </h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700">Опис</label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent min-h-[120px]"
            placeholder="Введіть детальний опис проєкту"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
        </div>

        <Input
          label="Заголовок концепції"
          placeholder="Введіть заголовок концепції"
          value={formData.concept_heading || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_heading: e.target.value })}
        />

        <Input
          label="Підпис концепції"
          placeholder="Введіть підпис концепції"
          value={formData.concept_caption || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_caption: e.target.value })}
        />

        <Input
          label="Цитата концепції"
          placeholder="Введіть цитату концепції"
          value={formData.concept_quote || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_quote: e.target.value })}
        />
      </div>
    </section>
  );

  const renderSectionLabelsSection = () => (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        Заголовки секцій
      </h2>
      <div className="flex flex-col gap-6">
        <Input
          label="Заголовок секції виклику"
          placeholder="Виклик"
          value={formData.challenge_title || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, challenge_title: e.target.value })}
        />

        <Input
          label="Заголовок секції матеріалів"
          placeholder="Матеріали"
          value={formData.materials_title || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, materials_title: e.target.value })}
        />

        <Input
          label="Заголовок секції контексту"
          placeholder="Контекст"
          value={formData.context_title || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, context_title: e.target.value })}
        />

        <Input
          label="Номер ілюстрації"
          placeholder="Ілюстрація 01"
          value={formData.figure_number || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, figure_number: e.target.value })}
        />

        <Input
          label="Підпис ілюстрації"
          placeholder="Основна їдальня"
          value={formData.figure_caption || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, figure_caption: e.target.value })}
        />
      </div>
    </section>
  );

  const renderAdditionalContentSection = () => (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        Додатковий контент секцій
      </h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700">Опис виклику</label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent min-h-[100px]"
            placeholder="Введіть детальний опис виклику..."
            value={formData.challenge_description || ''}
            onChange={(e) => setFormData({ ...formData, challenge_description: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700">Текст цитати</label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent min-h-[80px]"
            placeholder="Введіть текст цитати..."
            value={formData.quote_text || ''}
            onChange={(e) => setFormData({ ...formData, quote_text: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700">Опис контексту</label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent min-h-[100px]"
            placeholder="Введіть опис контексту проекту..."
            value={formData.context_description || ''}
            onChange={(e) => setFormData({ ...formData, context_description: e.target.value })}
          />
        </div>
      </div>
    </section>
  );

  const renderFooterNavigationSection = () => (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        Навігація футера
      </h2>
      <div className="flex flex-col gap-6">
        <Input
          label="Заголовок посилання наступного проекту"
          placeholder="Повернутися до портфоліо"
          value={formData.next_project_link_title || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, next_project_link_title: e.target.value })}
        />

        <Input
          label="Підзаголовок посилання"
          placeholder="Переглянути всі проекти"
          value={formData.next_project_link_subtitle || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, next_project_link_subtitle: e.target.value })}
        />

        <Input
          label="Заголовок інших проектів"
          placeholder="Інші проекти"
          value={formData.other_projects_title || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, other_projects_title: e.target.value })}
        />
      </div>
    </section>
  );

  const renderGallerySection = () => (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        Зображення галереї
      </h2>
      <div className="mb-4">
        <p className="text-sm text-zinc-600">Додайте зображення галереї проєкту.</p>
      </div>

      {isEditMode && (props as EditProps).galleryMedia.length > 0 && (
        <DragDropMediaList
          mediaItems={(props as EditProps).galleryMedia}
          onReorder={(props as EditProps).onGalleryMediaReorder}
          onRemove={(props as EditProps).onGalleryMediaRemove}
          onAltTextChange={(props as EditProps).onGalleryMediaAltTextChange}
        />
      )}

      {!isEditMode && (
        <MultiImageUpload
          images={(props as CreateProps).galleryMedia}
          onImagesChange={(props as CreateProps).setGalleryMedia}
          maxCount={10}
          label="Зображення галереї"
          placeholder="Перетягніть зображення галереї або перегляньте"
        />
      )}

      {isEditMode && (
        <MultiImageUpload
          images={(props as EditProps).galleryImagesToUpload}
          onImagesChange={(props as EditProps).setGalleryImagesToUpload}
          maxCount={10}
          label="Зображення галереї"
          placeholder="Перетягніть зображення галереї або перегляньте"
        />
      )}
    </section>
  );

  return (
    <>
      {renderHeroImageSection()}
      {renderMainInfoSection()}
      {renderDescriptionSection()}
      {renderSectionLabelsSection()}
      {renderAdditionalContentSection()}
      {renderFooterNavigationSection()}
      {renderGallerySection()}
    </>
  );
}
