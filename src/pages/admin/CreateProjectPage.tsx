import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/admin/ImageUpload';
import TagInput from '../../components/admin/TagInput';
import type { CreateProjectData } from '../../types/project';
import { portfolioService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    image: null as unknown as File,
    tags: [],
    architects: '',
    concept_heading: '',
    concept_caption: '',
    concept_quote: '',
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

    if (!formData.image || formData.image.size === 0) {
      newErrors.image = t.createProject.requiredField;
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
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col gap-6">
            <Input
              label={t.createProject.titleLabel}
              placeholder={t.createProject.titlePlaceholder}
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              required
            />

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

            <ImageUpload
              onFileSelect={(file) => setFormData({ ...formData, image: file as unknown as File })}
              error={errors.image}
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
              label="Архітектори"
              placeholder="Введіть назву архітектора або бюро"
              value={formData.architects || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, architects: e.target.value })}
            />

            <Input
              label="Заголовок концепції"
              placeholder="Введіть заголовок концепції (наприклад, Культурний Код)"
              value={formData.concept_heading || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_heading: e.target.value })}
            />

            <Input
              label="Підпис концепції"
              placeholder="Введіть підпис концепції (наприклад, Концепція дизайну)"
              value={formData.concept_caption || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_caption: e.target.value })}
            />

            <Input
              label="Цитата концепції"
              placeholder="Введіть цитату концепції (необов'язково)"
              value={formData.concept_quote || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, concept_quote: e.target.value })}
            />

            {errors.submit && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? t.createProject.creating : t.createProject.create}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
