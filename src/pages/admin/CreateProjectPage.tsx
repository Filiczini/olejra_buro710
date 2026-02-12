import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import ProjectForm from '../../components/admin/ProjectForm';
import ProjectPreview from '../../components/admin/ProjectPreview';
import type { CreateProjectData } from '../../types/project';
import { portfolioService } from '../../services/api';

const INITIAL_FORM_DATA: CreateProjectData = {
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
};

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProjectData>(INITIAL_FORM_DATA);
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
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tags', JSON.stringify(formData.tags));

      const optionalFields: (keyof CreateProjectData)[] = [
        'location', 'area', 'year', 'team', 'architects',
        'concept_heading', 'concept_caption', 'concept_quote',
        'short_description', 'category', 'subtitle', 'photo_credits',
        'challenge_title', 'materials_title', 'context_title',
        'figure_number', 'figure_caption',
        'challenge_description', 'quote_text', 'context_description',
        'next_project_link_title', 'next_project_link_subtitle', 'other_projects_title'
      ];

      optionalFields.forEach(field => {
        if (formData[field]) {
          formDataToSend.append(field, String(formData[field]));
        }
      });

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
            <ProjectForm
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              mode="create"
              heroMedia={formData.heroMedia}
              setHeroMedia={(media) => setFormData({ ...formData, heroMedia: media })}
              galleryMedia={formData.galleryMedia || []}
              setGalleryMedia={(media) => setFormData({ ...formData, galleryMedia: media })}
            />

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
