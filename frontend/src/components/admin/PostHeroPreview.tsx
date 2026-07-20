import { Icon } from '@iconify-icon/react';
import type { PostHeroFormData } from '../../types/post';

interface PostHeroPreviewProps {
  data: PostHeroFormData;
  title: string;
}

export default function PostHeroPreview({ data, title }: PostHeroPreviewProps) {
  const imageUrl = data.heroImage
    ? URL.createObjectURL(data.heroImage)
    : data.hero_image_url || null;

  // Mirrors PostHeroBlock's rendering rules exactly, so this preview never
  // shows/hides content the public page wouldn't.
  const displayTitle = data.hero_title || title;
  const hasHeroContent = Boolean(imageUrl || displayTitle);
  const hasTags = Array.isArray(data.hero_tags) && data.hero_tags.length > 0;
  const hasLocationOrYear = Boolean(data.hero_location || data.hero_year);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sticky top-8">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">Прев'ю hero секції</h3>

      <div className="relative w-full aspect-[16/9] bg-zinc-900 rounded-lg overflow-hidden">
        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt="Hero preview"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        )}

        {!hasHeroContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <Icon icon="solar:gallery-bold" width={48} />
              <p className="text-sm mt-2">Додайте зображення</p>
            </div>
          </div>
        )}

        {hasHeroContent && (
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            {(hasTags || hasLocationOrYear) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {hasTags &&
                  data.hero_tags!.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                {hasLocationOrYear && (
                  <span className="text-white/70 text-[10px] uppercase tracking-widest">
                    {data.hero_location}
                    {data.hero_location && data.hero_year ? ', ' : ''}
                    {data.hero_year}
                  </span>
                )}
              </div>
            )}

            <h4 className="text-xl md:text-2xl lg:text-3xl font-medium text-white tracking-tight leading-tight">
              {displayTitle || 'Заголовок сторінки'}
            </h4>

            {data.hero_subtitle && (
              <div className="mt-2">
                <p className="text-white/80 text-sm font-light leading-relaxed line-clamp-2">
                  {data.hero_subtitle}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                    <Icon icon="solar:arrow-down-linear" width={16} />
                  </div>
                  <span className="text-white/60 text-xs">Scroll to explore</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!hasHeroContent && (
        <p className="text-zinc-400 text-sm text-center py-4">
          Заповніть форму для перегляду прев'ю
        </p>
      )}
    </div>
  );
}
