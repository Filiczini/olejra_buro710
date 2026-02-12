import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TagInput from '../../components/admin/TagInput';
import MultiImageUpload from '../../components/admin/MultiImageUpload';
import SingleImageUpload from '../../components/admin/SingleImageUpload';
import ProjectPreview from '../../components/admin/ProjectPreview';
import type { CreateProjectData } from '../../types/project';
import { portfolioService } from '../../services/api';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    tags: [],
    architects: '',
    concept_heading: '',
    concept_caption: '',
    concept_quote: '',
    short_description: '',
    category: '',
    subtitle: '',
    photo_credits: '',
    challenge_title: '',
    materials_title: '',
    context_title: '',
    figure_number: '',
    figure_caption: '',
    challenge_description: '',
    quote_text: '',
    context_description: '',
    next_project_link_title: '',
    next_project_link_subtitle: '',
    other_projects_title: '',
    heroMedia: undefined,
    galleryMedia: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title.length < 2) {
      newErrors.title = "Це поле обов'язкове";
    }

    if (formData.description.length < 10) {
      newErrors.description = "Це поле обов'язкове";
    }

    if (!formData.heroMedia) {
      newErrors.heroMedia = "Головне зображення є обов'язковим";
    }

    if (formData.tags.length > 10) {
      newErrors.tags = "Це поле обов'язкове";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      if (formData.location) {
        formDataToSend.append('location', formData.location);
      }
      if (formData.area) {
        formDataToSend.append('area', formData.area);
      }
      if (formData.year) {
        formDataToSend.append('year', formData.year);
      }
      if (formData.team) {
        formDataToSend.append('team', formData.team);
      }
      if (formData.architects) {
        formDataToSend.append('architects', formData.architects);
      }
      if (formData.concept_heading) {
        formDataToSend.append('concept_heading', formData.concept_heading);
      }
      if (formData.concept_caption) {
        formDataToSend.append('concept_caption', formData.concept_caption);
      }
      if (formData.concept_quote) {
        formDataToSend.append('concept_quote', formData.concept_quote);
      }

      if (formData.short_description) {
        formDataToSend.append('short_description', formData.short_description);
      }
      if (formData.category) {
        formDataToSend.append('category', formData.category);
      }
      if (formData.subtitle) {
        formDataToSend.append('subtitle', formData.subtitle);
      }
      if (formData.photo_credits) {
        formDataToSend.append('photo_credits', formData.photo_credits);
      }
      if (formData.challenge_title) {
        formDataToSend.append('challenge_title', formData.challenge_title);
      }
      if (formData.materials_title) {
        formDataToSend.append('materials_title', formData.materials_title);
      }
      if (formData.context_title) {
        formDataToSend.append('context_title', formData.context_title);
      }
      if (formData.figure_number) {
        formDataToSend.append('figure_number', formData.figure_number);
      }
      if (formData.figure_caption) {
        formDataToSend.append('figure_caption', formData.figure_caption);
      }
      if (formData.challenge_description) {
        formDataToSend.append('challenge_description', formData.challenge_description);
      }
      if (formData.quote_text) {
        formDataToSend.append('quote_text', formData.quote_text);
      }
      if (formData.context_description) {
        formDataToSend.append('context_description', formData.context_description);
      }
      if (formData.next_project_link_title) {
        formDataToSend.append('next_project_link_title', formData.next_project_link_title);
      }
      if (formData.next_project_link_subtitle) {
        formDataToSend.append('next_project_link_subtitle', formData.next_project_link_subtitle);
      }
      if (formData.other_projects_title) {
        formDataToSend.append('other_projects_title', formData.other_projects_title);
      }

      if (formData.heroMedia) {
        formDataToSend.append('heroMedia', formData.heroMedia);
      }

      if (formData.galleryMedia && formData.galleryMedia.length > 0) {
        formData.galleryMedia.forEach((file) => {
          formDataToSend.append('galleryMedia', file);
        });
      }

      await portfolioService.create(formDataToSend);

      navigate('/admin/dashboard');
    } catch {
      setErrors({ submit: "Помилка створення проєкту" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-zinc-600 hover:text-zinc-900"
            >
              ← Повернутися до панелі керування
            </button>
            <h1 className="text-3xl font-bold text-zinc-900">Створити проєкт</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Image Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              Головне зображення
            </h2>
            <div className="mb-4">
              <p className="text-sm text-zinc-600">Додайте головне зображення.</p>
            </div>
            <SingleImageUpload
              image={formData.heroMedia}
              onImageChange={(img) => setFormData({ ...formData, heroMedia: img || undefined })}
              label="Головне зображення"
              placeholder="Перетягніть головне зображення або перегляньте"
              error={errors.heroMedia}
            />
          </section>

          {/* Main Info Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              Основна інформація
            </h2>
            <div className="flex flex-col gap-6">
              <Input
                label="Назва"
                placeholder="Введіть назву проєкту"
                value={formData.title}
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
                tags={formData.tags}
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

          {/* Description Section */}
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
                  value={formData.description}
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

          {/* Section Labels Section */}
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

          {/* Additional Section Content Section */}
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

          {/* Footer Navigation Section */}
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

          {/* Gallery Images Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              Зображення галереї
            </h2>
            <div className="mb-4">
              <p className="text-sm text-zinc-600">Додайте зображення галереї проєкту.</p>
            </div>
            <MultiImageUpload
              images={formData.galleryMedia || []}
              onImagesChange={(images) => setFormData({ ...formData, galleryMedia: images })}
              maxCount={10}
              label="Зображення галереї"
              placeholder="Перетягніть зображення галереї або перегляньте"
            />
          </section>

          {/* Submit Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {errors.submit && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-4">
                {errors.submit}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? 'Створення...' : 'Створити'}
            </Button>
          </section>
        </form>
        </div>

        {/* Right Column - Preview - Desktop Only */}
        <div className="hidden lg:block lg:w-[80%] lg:sticky lg:top-8 h-fit">
          <ProjectPreview
            heroImage={formData.heroMedia}
            title={formData.title}
            subtitle={formData.subtitle}
            shortDescription={formData.short_description}
            category={formData.category}
            tags={formData.tags}
            location={formData.location}
            year={formData.year}
            area={formData.area}
            photoCredits={formData.photo_credits}
            description={formData.description ? [formData.description] : []}
            challengeTitle={formData.challenge_title}
            challengeDescription={formData.challenge_description}
            quoteText={formData.quote_text}
            contextTitle={formData.context_title}
            contextDescription={formData.context_description}
            materialsTitle={formData.materials_title}
            materials={[]}
            team={formData.team}
            architects={formData.architects}
            figureNumber={formData.figure_number}
            figureCaption={formData.figure_caption}
            galleryMedia={formData.galleryMedia || []}
            nextProjectLinkTitle={formData.next_project_link_title}
            nextProjectLinkSubtitle={formData.next_project_link_subtitle}
            otherProjectsTitle={formData.other_projects_title}
          />
        </div>
      </div>
    </div>
  );
}
