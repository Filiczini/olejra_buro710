import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TagInput from '../../components/admin/TagInput';
import DragDropMediaList from '../../components/admin/DragDropMediaList';
import MultiImageUpload from '../../components/admin/MultiImageUpload';
import SingleImageUpload from '../../components/admin/SingleImageUpload';
import ProjectPreview from '../../components/admin/ProjectPreview';
import type { UpdateProjectData, Project, Media } from '../../types/project';
import { portfolioService } from '../../services/api';
import { useTranslation } from '../../contexts/LanguageContext';

export default function EditProjectPage() {
  const navigate = useNavigate();
  const t = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<UpdateProjectData>({
    title: '',
    description: '',
    tags: [],
    location: '',
    area: '',
    year: '',
    team: '',
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [heroMedia, setHeroMedia] = useState<Media[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<Media[]>([]);
  const [heroImageToUpload, setHeroImageToUpload] = useState<File | undefined>();
  const [galleryImagesToUpload, setGalleryImagesToUpload] = useState<File[]>([]);

  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      try {
        const data = await portfolioService.getById(id);
        setProject(data.project);
        setFormData({
          title: data.project.title,
          description: data.project.description[0] || '',
          tags: data.project.tags,
          location: data.project.location || '',
          area: data.project.area || '',
          year: data.project.year || '',
          team: data.project.team || '',
          architects: data.project.architects || '',
          concept_heading: data.project.concept_heading || '',
          concept_caption: data.project.concept_caption || '',
          concept_quote: data.project.concept_quote || '',
          short_description: data.project.short_description || '',
          category: data.project.category || '',
          subtitle: data.project.subtitle || '',
          photo_credits: data.project.photo_credits || '',
          challenge_title: data.project.challenge_title || '',
          materials_title: data.project.materials_title || '',
          context_title: data.project.context_title || '',
          figure_number: data.project.figure_number || '',
          figure_caption: data.project.figure_caption || '',
        });
        setHeroMedia(data.heroMedia || []);
        setGalleryMedia(data.galleryMedia || []);
      } catch (error) {
        console.error('Error loading project:', error);
        navigate('/admin/dashboard');
      } finally {
        setFetching(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title && formData.title.length < 2) {
      newErrors.title = t.editProject.requiredField;
    }

    if (formData.description && formData.description.length < 10) {
      newErrors.description = t.editProject.requiredField;
    }

    if (formData.tags && formData.tags.length > 10) {
      newErrors.tags = t.editProject.requiredField;
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
      if (formData.title) {
        formDataToSend.append('title', formData.title);
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.tags) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }
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

      if (heroMedia.length > 0) {
        const heroMediaIdsOrdered = heroMedia.map(m => m.id);
        heroMediaIdsOrdered.forEach(id => formDataToSend.append('heroMediaIdsOrdered', id));
      }

      if (galleryMedia.length > 0) {
        const galleryMediaIdsOrdered = galleryMedia.map(m => m.id);
        galleryMediaIdsOrdered.forEach(id => formDataToSend.append('galleryMediaIdsOrdered', id));
      }

      // Append new hero image to upload
      if (heroImageToUpload) {
        formDataToSend.append(`heroMedia`, heroImageToUpload);
      }

      // Append new gallery images to upload
      if (galleryImagesToUpload.length > 0) {
        galleryImagesToUpload.forEach((file) => {
          formDataToSend.append(`galleryMedia`, file);
        });
      }

      await portfolioService.update(id!, formDataToSend);

      navigate('/admin/dashboard');
    } catch {
      setErrors({ submit: t.editProject.error });
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryMediaReorder = (reorderedMedia: Media[]) => {
    setGalleryMedia(reorderedMedia);
  };

  const handleGalleryMediaRemove = (id: string) => {
    setGalleryMedia(prev => prev.filter(m => m.id !== id));
  };

  const handleGalleryAltTextChange = (id: string, alt: string) => {
    setGalleryMedia(prev => prev.map(m => m.id === id ? { ...m, alt } : m));
  };

  // Get hero image for preview (existing URL or new File)
  const heroImageForPreview = heroImageToUpload
    ? heroImageToUpload
    : (heroMedia.length > 0 ? heroMedia[0].url : undefined);

  if (fetching) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="text-lg text-zinc-600">{t.dashboard.loading}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="text-lg text-zinc-600">{t.dashboard.noProjects}</div>
      </div>
    );
  }

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
              ← {t.editProject.backToDashboard}
            </button>
            <h1 className="text-3xl font-bold text-zinc-900">{t.editProject.title}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Image Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {(t as any).editProject.heroImage || 'Hero Image'}
            </h2>
            <div className="mb-4">
              <p className="text-sm text-zinc-600">            {(t as any).editProject.heroImagesDescription || 'Add hero image that will be displayed prominently at the top of the project page.'}</p>
            </div>

            {/* Existing Hero Image */}
            {heroMedia.length > 0 && (
              <div className="mb-4">
                <div className="relative aspect-video w-full max-w-lg bg-zinc-100 rounded-lg overflow-hidden">
                  <img
                    src={heroMedia[0].url}
                    alt="Current hero image"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setHeroMedia([])}
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

            {/* Upload New Hero Image */}
            <SingleImageUpload
              image={heroImageToUpload}
              onImageChange={(img) => setHeroImageToUpload(img || undefined)}
              label={(t as any).editProject.addHeroImages || 'Add Hero Image'}
              placeholder={(t as any).editProject.heroImagesPlaceholder || 'Drag and drop hero image, or browse'}
            />
          </section>

          {/* Main Info Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {(t as any).createProject.sections.mainInfo || 'Main Info'}
            </h2>
            <div className="flex flex-col gap-6">
              <Input
                label={(t as any).createProject.titleLabel || 'Title'}
                placeholder={(t as any).createProject.titlePlaceholder || 'Project title'}
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
                tags={formData.tags || []}
                onTagsChange={(tags) => setFormData({ ...formData, tags })}
              />
              {errors.tags && <span className="text-sm text-red-500">{errors.tags}</span>}

              <Input
                label={(t as any).createProject.location || 'Location'}
                placeholder={(t as any).createProject.locationPlaceholder || 'Location'}
                value={formData.location || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
              />

              <Input
                label={(t as any).createProject.area || 'Area'}
                placeholder={(t as any).createProject.areaPlaceholder || 'Area'}
                value={formData.area || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, area: e.target.value })}
              />

              <Input
                label={(t as any).createProject.year || 'Year'}
                placeholder={(t as any).createProject.yearPlaceholder || 'Year'}
                value={formData.year || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, year: e.target.value })}
              />

              <Input
                label={(t as any).createProject.team || 'Team'}
                placeholder={(t as any).createProject.teamPlaceholder || 'Team'}
                value={formData.team || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, team: e.target.value })}
              />

              <Input
                label={(t as any).createProject.architects || 'Architects'}
                placeholder={(t as any).createProject.architectsPlaceholder || 'Architects'}
                value={formData.architects || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, architects: e.target.value })}
              />
            </div>
          </section>

          {/* Description Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
              {(t as any).createProject.sections.description || 'Description'}
            </h2>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-700">{(t as any).createProject.description || 'Description'}</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent min-h-[120px]"
                  placeholder={(t as any).createProject.descriptionPlaceholder || 'Project description'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
              </div>

              <Input
                label={(t as any).createProject.conceptHeading || 'Concept Heading'}
                placeholder={(t as any).createProject.conceptHeadingPlaceholder || 'Concept heading'}
                value={formData.concept_heading || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_heading: e.target.value })}
              />

              <Input
                label={(t as any).createProject.conceptCaption || 'Concept Caption'}
                placeholder={(t as any).createProject.conceptCaptionPlaceholder || 'Concept caption'}
                value={formData.concept_caption || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_caption: e.target.value })}
              />

              <Input
                label={(t as any).createProject.conceptQuote || 'Concept Quote'}
                placeholder={(t as any).createProject.conceptQuotePlaceholder || 'Concept quote'}
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
              {(t as any).createProject.sections.galleryImages || 'Gallery Images'}
            </h2>
            <div className="mb-4">
              <p className="text-sm text-zinc-600">{(t as any).createProject.galleryImagesDescription || 'Manage gallery images'}</p>
            </div>

            {/* Existing Gallery Media */}
            {galleryMedia.length > 0 && (
              <DragDropMediaList
                mediaItems={galleryMedia}
                onReorder={handleGalleryMediaReorder}
                onRemove={handleGalleryMediaRemove}
                onAltTextChange={handleGalleryAltTextChange}
              />
            )}

            {/* Add New Gallery Images */}
            <MultiImageUpload
              images={galleryImagesToUpload}
              onImagesChange={setGalleryImagesToUpload}
              maxCount={10}
              label={(t as any).createProject.galleryImages || 'Gallery Images'}
              placeholder={(t as any).createProject.galleryImagesPlaceholder || 'Upload gallery images'}
            />
          </section>

          {/* Submit Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {errors.submit && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-4">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1 py-3">
                {loading ? (t as any).editProject.saving : (t as any).editProject.save}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/dashboard')}
                className="flex-1 py-3"
              >
                {(t as any).editProject.cancel || 'Cancel'}
              </Button>
            </div>
          </section>
        </form>
        </div>

        {/* Right Column - Preview - Desktop Only */}
        <div className="hidden lg:block lg:w-[700px] lg:sticky lg:top-8 h-fit">
          <ProjectPreview
            heroImage={heroImageForPreview}
            title={formData.title || ''}
            subtitle={formData.subtitle}
            shortDescription={formData.short_description}
            category={formData.category}
            tags={formData.tags || []}
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
