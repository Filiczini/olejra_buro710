import Input from '../ui/Input';
import SingleImageUpload from './SingleImageUpload';
import TagInput from './TagInput';
import type { PostHero } from '../../types/post';

export interface PostHeroFormData extends PostHero {
  heroImage?: File;
}

interface PostHeroFormProps {
  data: PostHeroFormData;
  onChange: (data: PostHeroFormData) => void;
  errors?: Record<string, string>;
}

export default function PostHeroForm({ data, onChange, errors }: PostHeroFormProps) {
  const handleChange = (field: keyof PostHeroFormData, value: string | File | string[] | undefined) => {
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
          placeholder="Перетягніть зображення або натисніть для вибору"
          error={errors?.heroImage}
        />

        <Input
          label="Hero заголовок"
          placeholder="Введіть заголовок hero секції"
          value={data.hero_title || ''}
          onChange={(e) => handleChange('hero_title', e.target.value)}
          error={errors?.hero_title}
        />

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Hero підзаголовок (опис)
          </label>
          <textarea
            value={data.hero_subtitle || ''}
            onChange={(e) => handleChange('hero_subtitle', e.target.value)}
            placeholder="Короткий опис сторінки"
            rows={3}
            className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
          />
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
            label="Локація"
            placeholder="Київ, Україна"
            value={data.hero_location || ''}
            onChange={(e) => handleChange('hero_location', e.target.value)}
          />

          <Input
            label="Рік"
            placeholder="2024"
            value={data.hero_year || ''}
            onChange={(e) => handleChange('hero_year', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
