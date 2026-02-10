import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TagInput from '../../components/admin/TagInput';
import MultiImageUpload from '../../components/admin/MultiImageUpload';
import type { CreateProjectData } from '../../types/project';
import { portfolioService } from '../../services/api';
import { useTranslation } from '../../contexts/LanguageContext';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const t = useTranslation();
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    tags: [],
    architects: '',
    concept_heading: '',
    concept_caption: '',
    concept_quote: '',
    hero_description: '',
    heroMedia: [],
    galleryMedia: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title.length < 2) {
      newErrors.title = t.createProject.requiredField;
    }

    if (formData.description.length < 10) {
      newErrors.description = t.createProject.requiredField;
    }

    if (!formData.heroMedia || formData.heroMedia.length === 0) {
      newErrors.heroMedia = t.createProject.heroImagesRequired;
    }

    if (formData.tags.length > 10) {
      newErrors.tags = t.createProject.requiredField;
    }

    if (!formData.heroMedia || formData.heroMedia.length === 0) {
      newErrors.heroMedia = t.createProject.heroImagesRequired;
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

      if (formData.hero_description) {
        formDataToSend.append('hero_description', formData.hero_description);
      }

      if (formData.heroMedia && formData.heroMedia.length > 0) {
        formData.heroMedia.forEach((file) => {
          formDataToSend.append('heroMedia', file);
        });
      }

      if (formData.galleryMedia && formData.galleryMedia.length > 0) {
        formData.galleryMedia.forEach((file) => {
          formDataToSend.append('galleryMedia', file);
        });
      }

      await portfolioService.create(formDataToSend);

      navigate('/admin/dashboard');
    } catch {
      setErrors({ submit: t.createProject.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-zinc-600 hover:text-zinc-900"
          >
            ← {t.createProject.backToDashboard}
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">{t.createProject.title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Info Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {t.createProject.sections.mainInfo}
            </h2>
            <div className="flex flex-col gap-6">
              <Input
                label={t.createProject.titleLabel}
                placeholder={t.createProject.titlePlaceholder}
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                required
              />

              <Input
                label={(t as any).project.heroDescription || 'Photo description'}
                placeholder={t.createProject.heroDescriptionPlaceholder}
                value={formData.hero_description || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, hero_description: e.target.value })}
              />

              <TagInput
                tags={formData.tags}
                onTagsChange={(tags) => setFormData({ ...formData, tags })}
              />
              {errors.tags && <span className="text-sm text-red-500">{errors.tags}</span>}

              <Input
                label={t.createProject.location}
                placeholder={t.createProject.locationPlaceholder}
                value={formData.location || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
              />

              <Input
                label={t.createProject.area}
                placeholder={t.createProject.areaPlaceholder}
                value={formData.area || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, area: e.target.value })}
              />

              <Input
                label={t.createProject.year}
                placeholder={t.createProject.yearPlaceholder}
                value={formData.year || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, year: e.target.value })}
              />

              <Input
                label={t.createProject.team}
                placeholder={t.createProject.teamPlaceholder}
                value={formData.team || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, team: e.target.value })}
              />

              <Input
                label={t.createProject.architects}
                placeholder={t.createProject.architectsPlaceholder}
                value={formData.architects || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, architects: e.target.value })}
              />
            </div>
          </section>

          {/* Description Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {t.createProject.sections.description}
            </h2>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">{t.createProject.description}</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent min-h-[120px]"
                  placeholder={t.createProject.descriptionPlaceholder}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
              </div>

              <Input
                label={t.createProject.conceptHeading}
                placeholder={t.createProject.conceptHeadingPlaceholder}
                value={formData.concept_heading || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_heading: e.target.value })}
              />

              <Input
                label={t.createProject.conceptCaption}
                placeholder={t.createProject.conceptCaptionPlaceholder}
                value={formData.concept_caption || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_caption: e.target.value })}
              />

              <Input
                label={t.createProject.conceptQuote}
                placeholder={t.createProject.conceptQuotePlaceholder}
                value={formData.concept_quote || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_quote: e.target.value })}
              />
            </div>
          </section>

          {/* Hero Images Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {t.createProject.sections.heroImages}
            </h2>
            <div className="mb-4">
              <p className="text-sm text-zinc-600">{t.createProject.heroImagesDescription}</p>
            </div>
            <MultiImageUpload
              images={formData.heroMedia || []}
              onImagesChange={(images) => setFormData({ ...formData, heroMedia: images })}
              maxCount={5}
              label={t.createProject.heroImages}
              placeholder={t.createProject.heroImagesPlaceholder}
              error={errors.heroMedia}
            />
          </section>

          {/* Gallery Images Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {t.createProject.sections.galleryImages}
            </h2>
            <div className="mb-4">
              <p className="text-sm text-zinc-600">{t.createProject.galleryImagesDescription}</p>
            </div>
            <MultiImageUpload
              images={formData.galleryMedia || []}
              onImagesChange={(images) => setFormData({ ...formData, galleryMedia: images })}
              maxCount={10}
              label={t.createProject.galleryImages}
              placeholder={t.createProject.galleryImagesPlaceholder}
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
              {loading ? t.createProject.creating : t.createProject.create}
            </Button>
          </section>
        </form>
      </div>
    </div>
  );
}
