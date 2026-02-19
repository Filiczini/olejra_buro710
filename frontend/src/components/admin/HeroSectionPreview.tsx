import { Icon } from '@iconify-icon/react';
import type { HeroSectionData } from './HeroSectionForm';

interface HeroSectionPreviewProps {
  data: HeroSectionData;
  existingImageUrl?: string | null;
}

export default function HeroSectionPreview({ data, existingImageUrl }: HeroSectionPreviewProps) {
  const imageUrl = data.heroImage ? URL.createObjectURL(data.heroImage) : existingImageUrl;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sticky top-8">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">Прев'ю hero секції</h3>

      <div className="relative w-full aspect-[16/9] bg-zinc-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Hero preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
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
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {data.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[8px] font-medium uppercase tracking-wider text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-8">
                {data.subtitle && (
                  <p className="text-xs font-light text-zinc-300 mb-1 line-clamp-1">
                    {data.subtitle}
                  </p>
                )}
                <h4 className="text-2xl font-medium tracking-tight text-white leading-tight line-clamp-2">
                  {data.title || 'Заголовок проєкту'}
                </h4>
              </div>

              <div className="col-span-4 flex justify-end gap-4">
                {data.location && (
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500 mb-0.5">
                      Локація
                    </span>
                    <span className="text-[10px] font-medium text-white">{data.location}</span>
                  </div>
                )}
                {data.year && (
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500 mb-0.5">
                      Рік
                    </span>
                    <span className="text-[10px] font-medium text-white">{data.year}</span>
                  </div>
                )}
                {data.area && (
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-widest text-zinc-500 mb-0.5">
                      Площа
                    </span>
                    <span className="text-[10px] font-medium text-white">{data.area} м²</span>
                  </div>
                )}
              </div>
            </div>
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
