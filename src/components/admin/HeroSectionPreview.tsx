import { Icon } from '@iconify-icon/react';
import type { HeroSectionData } from './HeroSectionForm';

interface HeroSectionPreviewProps {
  data: HeroSectionData;
  existingImageUrl?: string | null;
}

export default function HeroSectionPreview({ data, existingImageUrl }: HeroSectionPreviewProps) {
  const imageUrl = data.heroImage 
    ? URL.createObjectURL(data.heroImage) 
    : existingImageUrl;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sticky top-8">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">Прев'ю hero секції</h3>
      
      <div className="relative w-full aspect-[16/9] bg-zinc-100 rounded-lg overflow-hidden mb-4">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Hero preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-100">
            <div className="text-center text-zinc-400">
              <Icon icon="solar:gallery-bold" width={48} />
              <p className="text-sm mt-2">Додайте зображення</p>
            </div>
          </div>
        )}

        {imageUrl && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h4 className="text-xl font-bold mb-1 line-clamp-2">
              {data.title || 'Заголовок проєкту'}
            </h4>
            {data.subtitle && (
              <p className="text-sm text-white/80 line-clamp-1">{data.subtitle}</p>
            )}
          </div>
        )}
      </div>

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
        {data.location && (
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:map-point-linear" width={16} />
            <span>{data.location}</span>
          </div>
        )}
        {data.year && (
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:calendar-linear" width={16} />
            <span>{data.year}</span>
          </div>
        )}
        {data.area && (
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:ruler-angular-linear" width={16} />
            <span>{data.area}</span>
          </div>
        )}
      </div>

      {!data.title && !data.heroImage && !data.tags.length && !data.location && (
        <p className="text-zinc-400 text-sm text-center py-4">
          Заповніть форму для перегляду прев'ю
        </p>
      )}
    </div>
  );
}
