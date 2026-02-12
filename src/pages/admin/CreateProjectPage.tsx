import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../../components/admin/ProjectForm';
import HeroSectionForm, { type HeroSectionData } from '../../components/admin/HeroSectionForm';
import HeroSectionPreview from '../../components/admin/HeroSectionPreview';
import { portfolioService } from '../../services/api';

const INITIAL_HERO_DATA: HeroSectionData = {
  heroImage: undefined,
  title: '',
  subtitle: '',
  tags: [],
  location: '',
  year: '',
  area: '',
};

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroSectionData>(INITIAL_HERO_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!heroData.heroImage) {
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', heroData.title);
      formDataToSend.append('description', heroData.subtitle || heroData.title);
      formDataToSend.append('tags', JSON.stringify(heroData.tags));
      
      if (heroData.location) formDataToSend.append('location', heroData.location);
      if (heroData.year) formDataToSend.append('year', heroData.year);
      if (heroData.area) formDataToSend.append('area', heroData.area);
      if (heroData.subtitle) formDataToSend.append('short_description', heroData.subtitle);
      if (heroData.heroImage) formDataToSend.append('heroMedia', heroData.heroImage);

      await portfolioService.create(formDataToSend);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: 'Помилка створення проєкту' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="text-zinc-600 hover:text-zinc-900"
        >
          ← Повернутися до панелі керування
        </button>
        <h1 className="text-3xl font-bold text-zinc-900">Створити проєкт</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <ProjectForm
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Створити"
            submitLoadingLabel="Створення..."
          >
            <HeroSectionForm
              data={heroData}
              onChange={setHeroData}
              errors={errors}
            />
          </ProjectForm>
        </div>

        <div className="lg:w-[400px]">
          <HeroSectionPreview data={heroData} />
        </div>
      </div>
    </div>
  );
}
