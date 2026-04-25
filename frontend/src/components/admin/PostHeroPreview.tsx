import { Icon } from '@iconify-icon/react';
import type { PostHeroFormData } from './PostHeroForm';

interface PostHeroPreviewProps {
  data: PostHeroFormData;
}

export default function PostHeroPreview({ data }: PostHeroPreviewProps) {
  const imageUrl = data.heroImage
    ? URL.createObjectURL(data.heroImage)
    : data.hero_image_url || null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sticky top-8">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">Прев'ю hero секції</h3>

      <div className="relative w-full aspect-[16/9] bg-zinc-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Hero preview"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <div className="text-center text-zinc-400">
              <Icon icon="solar:gallery-bold" width={48} />
              <p className="text-sm mt-2">Додайте зображення</p>
            </div>
          </div>
        )}

        {imageUrl && (
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            {Array.isArray(data.hero_tags) && data.hero_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.hero_tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
                {data.hero_location && (
                  <span className="text-white/70 text-[10px] uppercase tracking-widest">
                    {data.hero_location}
                    {data.hero_year ? `, ${data.hero_year}` : ''}
                  </span>
                )}
              </div>
            )}

            <h4 className="text-xl md:text-2xl lg:text-3xl font-medium text-white tracking-tight leading-tight">
              {data.hero_title || 'Заголовок сторінки'}
            </h4>

            {data.hero_subtitle && (
              <p className="text-white/80 text-sm font-light leading-relaxed mt-2 line-clamp-2">
                {data.hero_subtitle}
              </p>
            )}

            <div className="mt-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                <Icon icon="solar:arrow-down-linear" width={16} />
              </div>
              <span className="text-white/60 text-xs">Scroll to explore</span>
            </div>
          </div>
        )}
      </div>

      {!data.hero_title &&
        !data.heroImage &&
        !data.hero_image_url &&
        !(Array.isArray(data.hero_tags) && data.hero_tags.length) && (
          <p className="text-zinc-400 text-sm text-center py-4">
            Заповніть форму для перегляду прев'ю
          </p>
        )}
    </div>
  );
}
