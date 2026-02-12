import Input from '../ui/Input';
import SingleImageUpload from './SingleImageUpload';
import TagInput from './TagInput';

export interface HeroSectionData {
  heroImage?: File;
  title: string;
  subtitle: string;
  tags: string[];
  location: string;
  year: string;
  area: string;
}

interface HeroSectionFormProps {
  data: HeroSectionData;
  onChange: (data: HeroSectionData) => void;
  errors?: Record<string, string>;
  initialImageUrl?: string | null;
}

export default function HeroSectionForm({ data, onChange, errors, initialImageUrl }: HeroSectionFormProps) {
  const handleChange = (field: keyof HeroSectionData, value: string | File | undefined | string[]) => {
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
          initialImageUrl={initialImageUrl}
          label="Головне зображення"
          placeholder="Перетягніть зображення або натисніть для вибору"
          error={errors?.heroImage}
        />

        <Input
          label="Заголовок"
          placeholder="Введіть назву проєкту"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors?.title}
          required
        />

        <Input
          label="Підзаголовок"
          placeholder="Короткий опис проєкту"
          value={data.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
        />

        <TagInput
          tags={data.tags}
          onTagsChange={(tags) => handleChange('tags', tags)}
          maxTags={5}
          label="Теги"
          placeholder="Введіть тег і натисніть Enter"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Локація"
            placeholder="Київ, Україна"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />

          <Input
            label="Рік"
            placeholder="2024"
            value={data.year}
            onChange={(e) => handleChange('year', e.target.value)}
          />

          <Input
            label="Площа"
            placeholder="250 м²"
            value={data.area}
            onChange={(e) => handleChange('area', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
