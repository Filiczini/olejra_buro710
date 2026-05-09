import Input from '../ui/Input';
import SingleImageUpload from './SingleImageUpload';
import TagInput from './TagInput';
import type { PostHeroFormData } from '../../types/post';

interface PostHeroFormProps {
  data: PostHeroFormData;
  onChange: (data: PostHeroFormData) => void;
  errors?: Record<string, string>;
  onBlurField?: (field: string, value: string) => void;
}

export default function PostHeroForm({ data, onChange, errors, onBlurField }: PostHeroFormProps) {
  const handleChange = (
    field: keyof PostHeroFormData,
    value: string | File | string[] | undefined
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        Hero секція
      </h2>

      <div className="flex flex-col gap-6">
        <SingleImageUpload
          image={data.heroImage}
          onImageChange={(img) => handleChange('heroImage', img || undefined)}
          initialImageUrl={data.hero_image_url}
          label="Головне зображення"
          placeholder="Перетягніть зображення або натисніть для вибору файлу"
          error={errors?.heroImage}
        />

        <Input
          id="hero-title"
          name="hero_title"
          label="Hero заголовок"
          placeholder="Введіть заголовок hero секції"
          value={data.hero_title || ''}
          onChange={(e) => handleChange('hero_title', e.target.value)}
          onBlur={(e) => onBlurField?.('hero_title', e.target.value)}
          error={errors?.hero_title}
        />

        <div>
          <label htmlFor="hero-subtitle" className="block text-sm font-medium text-zinc-700 mb-2">
            Hero підзаголовок (опис)
          </label>
          <textarea
            id="hero-subtitle"
            name="hero_subtitle"
            value={data.hero_subtitle || ''}
            onChange={(e) => handleChange('hero_subtitle', e.target.value)}
            onBlur={(e) => onBlurField?.('hero_subtitle', e.target.value)}
            placeholder="Короткий опис сторінки"
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none ${errors?.hero_subtitle ? 'border-red-500' : 'border-zinc-200'}`}
          />
          {errors?.hero_subtitle && (
            <span className="text-sm text-red-500 mt-1 block">{errors.hero_subtitle}</span>
          )}
        </div>

        <TagInput
          tags={data.hero_tags || []}
          onTagsChange={(tags) => handleChange('hero_tags', tags)}
          maxTags={5}
          label="Теги"
          placeholder="Введіть тег і натисніть Enter"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="hero-location"
            name="hero_location"
            label="Локація"
            placeholder="Київ, Україна"
            value={data.hero_location || ''}
            onChange={(e) => handleChange('hero_location', e.target.value)}
            onBlur={(e) => onBlurField?.('hero_location', e.target.value)}
            error={errors?.hero_location}
          />

          <Input
            id="hero-year"
            name="hero_year"
            label="Рік"
            placeholder="2024"
            value={data.hero_year || ''}
            onChange={(e) => handleChange('hero_year', e.target.value)}
            onBlur={(e) => onBlurField?.('hero_year', e.target.value)}
            error={errors?.hero_year}
          />
        </div>
      </div>
    </section>
  );
}
