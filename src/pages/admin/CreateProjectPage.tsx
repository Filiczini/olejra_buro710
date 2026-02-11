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
    short_description: '',
    category: '',
    subtitle: '',
    photo_credits: '',
    challenge_title: '',
    materials_title: '',
    context_title: '',
    figure_number: '',
    figure_caption: '',
    heroMedia: undefined,
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

    if (!formData.heroMedia) {
      newErrors.heroMedia = t.createProject.heroImagesRequired;
    }

    if (formData.tags.length > 10) {
      newErrors.tags = t.createProject.requiredField;
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
      setErrors({ submit: t.createProject.error });
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
              ← {t.createProject.backToDashboard}
            </button>
            <h1 className="text-3xl font-bold text-zinc-900">{t.createProject.title}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Image Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {t.createProject.sections.heroImage}
            </h2>
            <div className="mb-4">
              <p className="text-sm text-zinc-600">{t.createProject.heroImagesDescription}</p>
            </div>
            <SingleImageUpload
              image={formData.heroMedia}
              onImageChange={(img) => setFormData({ ...formData, heroMedia: img || undefined })}
              label={t.createProject.heroImage}
              placeholder={t.createProject.heroImagesPlaceholder}
              error={errors.heroMedia}
            />
          </section>

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
                label={(t as any).createProject.shortDescription || 'Short Description'}
                placeholder={(t as any).createProject.shortDescriptionPlaceholder || 'Brief project description for hero section'}
                value={formData.short_description || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, short_description: e.target.value })}
              />

              <Input
                label={(t as any).createProject.category || 'Category'}
                placeholder={(t as any).createProject.categoryPlaceholder || 'Project category (e.g., Residential / Modern)'}
                value={formData.category || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, category: e.target.value })}
              />

              <Input
                label={(t as any).createProject.subtitle || 'Subtitle'}
                placeholder={(t as any).createProject.subtitlePlaceholder || 'Project subtitle'}
                value={formData.subtitle || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subtitle: e.target.value })}
              />

              <Input
                label={(t as any).createProject.photoCredits || 'Photo Credits'}
                placeholder={(t as any).createProject.photoCreditsPlaceholder || 'Photographer name'}
                value={formData.photo_credits || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, photo_credits: e.target.value })}
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

          {/* Section Labels Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {(t as any).createProject.sections.sectionLabels || 'Section Labels'}
            </h2>
            <div className="flex flex-col gap-6">
              <Input
                label={(t as any).createProject.challengeTitle || 'Challenge Section Title'}
                placeholder={(t as any).createProject.challengeTitlePlaceholder || 'The Challenge'}
                value={formData.challenge_title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, challenge_title: e.target.value })}
              />

              <Input
                label={(t as any).createProject.materialsTitle || 'Materials Section Title'}
                placeholder={(t as any).createProject.materialsTitlePlaceholder || 'Materials'}
                value={formData.materials_title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, materials_title: e.target.value })}
              />

              <Input
                label={(t as any).createProject.contextTitle || 'Context Section Title'}
                placeholder={(t as any).createProject.contextTitlePlaceholder || 'Context'}
                value={formData.context_title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, context_title: e.target.value })}
              />

              <Input
                label={(t as any).createProject.figureNumber || 'Figure Number'}
                placeholder={(t as any).createProject.figureNumberPlaceholder || 'Figure 01'}
                value={formData.figure_number || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, figure_number: e.target.value })}
              />

              <Input
                label={(t as any).createProject.figureCaption || 'Figure Caption'}
                placeholder={(t as any).createProject.figureCaptionPlaceholder || 'Main Dining Hall'}
                value={formData.figure_caption || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, figure_caption: e.target.value })}
              />
            </div>
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

        {/* Right Column - Preview - Desktop Only */}
        <div className="hidden lg:block lg:w-[700px] lg:sticky lg:top-8 h-fit">
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
          />
        </div>
      </div>
    </div>
  );
}
