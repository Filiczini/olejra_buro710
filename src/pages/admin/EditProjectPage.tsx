import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import ProjectForm from '../../components/admin/ProjectForm';
import ProjectPreview from '../../components/admin/ProjectPreview';
import type { Project, Media } from '../../types/project';
import { portfolioService } from '../../services/api';

interface FormData {
  title: string;
  description: string;
  tags: string[];
  location: string;
  area: string;
  year: string;
  team: string;
  architects: string;
  concept_heading: string;
  concept_caption: string;
  concept_quote: string;
  short_description: string;
  category: string;
  subtitle: string;
  photo_credits: string;
  challenge_title: string;
  materials_title: string;
  context_title: string;
  figure_number: string;
  figure_caption: string;
  challenge_description: string;
  quote_text: string;
  context_description: string;
  next_project_link_title: string;
  next_project_link_subtitle: string;
  other_projects_title: string;
}

const INITIAL_FORM_DATA: FormData = {
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
  challenge_description: '',
  quote_text: '',
  context_description: '',
  next_project_link_title: '',
  next_project_link_subtitle: '',
  other_projects_title: '',
};

export default function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
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
          challenge_description: data.project.challenge_description || '',
          quote_text: data.project.quote_text || '',
          context_description: data.project.context_description || '',
          next_project_link_title: data.project.next_project_link_title || '',
          next_project_link_subtitle: data.project.next_project_link_subtitle || '',
          other_projects_title: data.project.other_projects_title || '',
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
      newErrors.title = "Це поле обов'язкове";
    }

    if (formData.description && formData.description.length < 10) {
      newErrors.description = "Це поле обов'язкове";
    }

    if (formData.tags && formData.tags.length > 10) {
      newErrors.tags = "Максим 10 тегів";
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

      const fields = [
        'title', 'description', 'location', 'area', 'year', 'team', 'architects',
        'concept_heading', 'concept_caption', 'concept_quote',
        'short_description', 'category', 'subtitle', 'photo_credits',
        'challenge_title', 'materials_title', 'context_title',
        'figure_number', 'figure_caption',
        'challenge_description', 'quote_text', 'context_description',
        'next_project_link_title', 'next_project_link_subtitle', 'other_projects_title'
      ];

      fields.forEach(field => {
        if (formData[field as keyof typeof formData]) {
          formDataToSend.append(field, String(formData[field as keyof typeof formData]));
        }
      });

      if (formData.tags) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }

      if (heroMedia.length > 0) {
        heroMedia.map(m => m.id).forEach(id => formDataToSend.append('heroMediaIdsOrdered', id));
      }

      if (galleryMedia.length > 0) {
        galleryMedia.map(m => m.id).forEach(id => formDataToSend.append('galleryMediaIdsOrdered', id));
      }

      if (heroImageToUpload) {
        formDataToSend.append('heroMedia', heroImageToUpload);
      }

      if (galleryImagesToUpload.length > 0) {
        galleryImagesToUpload.forEach((file) => {
          formDataToSend.append('galleryMedia', file);
        });
      }

      await portfolioService.update(id!, formDataToSend);
      navigate('/admin/dashboard');
    } catch {
      setErrors({ submit: "Помилка оновлення проєкту" });
    } finally {
      setLoading(false);
    }
  };

  const handleHeroMediaRemove = () => setHeroMedia([]);

  const handleGalleryMediaReorder = (reorderedMedia: Media[]) => setGalleryMedia(reorderedMedia);

  const handleGalleryMediaRemove = (mediaId: string) => {
    setGalleryMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const handleGalleryAltTextChange = (mediaId: string, alt: string) => {
    setGalleryMedia(prev => prev.map(m => m.id === mediaId ? { ...m, alt } : m));
  };

  const heroImageForPreview = heroImageToUpload
    ? heroImageToUpload
    : (heroMedia.length > 0 ? heroMedia[0].url : undefined);

  if (fetching) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="text-lg text-zinc-600">Завантаження...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="text-lg text-zinc-600">Проекти не знайдено</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-zinc-600 hover:text-zinc-900"
            >
              ← Повернутися до панелі керування
            </button>
            <h1 className="text-3xl font-bold text-zinc-900">Редагувати проєкт</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <ProjectForm
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              mode="edit"
              heroMedia={heroMedia}
              setHeroMedia={setHeroMedia}
              heroImageToUpload={heroImageToUpload}
              setHeroImageToUpload={setHeroImageToUpload}
              galleryMedia={galleryMedia}
              setGalleryMedia={setGalleryMedia}
              galleryImagesToUpload={galleryImagesToUpload}
              setGalleryImagesToUpload={setGalleryImagesToUpload}
              onHeroMediaRemove={handleHeroMediaRemove}
              onGalleryMediaReorder={handleGalleryMediaReorder}
              onGalleryMediaRemove={handleGalleryMediaRemove}
              onGalleryMediaAltTextChange={handleGalleryAltTextChange}
            />

            <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              {errors.submit && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-4">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1 py-3">
                  {loading ? 'Збереження...' : 'Зберегти'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex-1 py-3"
                >
                  Скасувати
                </Button>
              </div>
            </section>
          </form>
        </div>

        <div className="hidden lg:block lg:w-[80%] lg:sticky lg:top-8 h-fit">
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
            galleryMedia={galleryImagesToUpload.length > 0 ? galleryImagesToUpload : galleryMedia.map(m => m.url)}
            nextProjectLinkTitle={formData.next_project_link_title}
            nextProjectLinkSubtitle={formData.next_project_link_subtitle}
            otherProjectsTitle={formData.other_projects_title}
          />
        </div>
      </div>
    </div>
  );
}
