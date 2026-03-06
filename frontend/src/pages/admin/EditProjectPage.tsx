import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { logger } from '../../lib/logger';
import Button from '../../components/ui/Button';
import HeroSectionForm, { type HeroSectionData } from '../../components/admin/HeroSectionForm';
import HeroSectionPreview from '../../components/admin/HeroSectionPreview';
import type { Media } from '../../types/project';
import { portfolioService } from '../../services/api';

export default function EditProjectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [heroData, setHeroData] = useState<HeroSectionData>({
    heroImage: undefined,
    title: '',
    subtitle: '',
    tags: [],
    location: '',
    year: '',
    area: '',
  });
  const [existingHeroUrl, setExistingHeroUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      try {
        const data = (await portfolioService.getById(id)) as unknown as {
          project: {
            title: string;
            subtitle?: string;
            tags: string[];
            location?: string;
            year?: string;
            area?: string;
          };
          heroMedia: Media[];
        };

        setHeroData({
          heroImage: undefined,
          title: data.project.title || '',
          subtitle: data.project.subtitle || '',
          tags: data.project.tags || [],
          location: data.project.location || '',
          year: data.project.year || '',
          area: data.project.area || '',
        });

        if (data.heroMedia && data.heroMedia.length > 0) {
          setExistingHeroUrl(data.heroMedia[0].url);
        }
      } catch (error) {
        logger.error('Error loading project:', error);
        navigate('/admin/dashboard');
      } finally {
        setFetching(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!heroData.heroImage && !existingHeroUrl) {
      newErrors.heroImage = 'Додайте головне зображення';
    }

    if (!heroData.title.trim()) {
      newErrors.title = 'Введіть назву проєкту';
    } else if (heroData.title.trim().length < 2) {
      newErrors.title = 'Назва має містити мінімум 2 символи';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', heroData.title);
      formDataToSend.append('subtitle', heroData.subtitle || '');
      formDataToSend.append('tags', JSON.stringify(heroData.tags));

      if (heroData.location) formDataToSend.append('location', heroData.location);
      if (heroData.year) formDataToSend.append('year', heroData.year);
      if (heroData.area) formDataToSend.append('area', heroData.area);
      if (heroData.heroImage) formDataToSend.append('heroMedia', heroData.heroImage);

      await portfolioService.update(id, formDataToSend);
      navigate('/admin/dashboard');
    } catch (error) {
      logger.error('Error updating project:', error);
      setErrors({ submit: 'Помилка оновлення проєкту' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="text-lg text-zinc-600">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="text-zinc-600 hover:text-zinc-900 cursor-pointer"
        >
          ← Повернутися до панелі керування
        </button>
        <h1 className="text-3xl font-bold text-zinc-900">Редагувати проєкт</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            <HeroSectionForm
              data={heroData}
              onChange={setHeroData}
              errors={errors}
              initialImageUrl={existingHeroUrl}
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

        <div className="lg:w-[400px]">
          <HeroSectionPreview data={heroData} existingImageUrl={existingHeroUrl} />
        </div>
      </div>
    </div>
  );
}
