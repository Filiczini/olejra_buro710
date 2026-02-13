import { Icon } from '@iconify-icon/react';
import type { Post } from '../../types/post';

interface PostHeroBlockProps {
  post: Post;
}

export default function PostHeroBlock({ post }: PostHeroBlockProps) {
  const {
    hero_image_url,
    hero_title,
    hero_subtitle,
    hero_tags,
    hero_location,
    hero_year,
    title,
  } = post;

  const displayTitle = hero_title || title;
  const hasHeroContent = hero_image_url || displayTitle;

  if (!hasHeroContent) return null;

  return (
    <header className="relative h-screen w-full flex items-end justify-start overflow-hidden">
      <div className="absolute inset-0 bg-zinc-900">
        {hero_image_url && (
          <>
            <img
              src={hero_image_url}
              alt={displayTitle}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        )}
      </div>

      <div className="relative z-10 p-6 md:p-12 w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            {hero_tags && hero_tags.length > 0 && (
              <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border border-white/10">
                {hero_tags[0]}
              </span>
            )}
            {(hero_location || hero_year) && (
              <span className="text-white/70 text-[10px] uppercase tracking-widest">
                {hero_location}{hero_location && hero_year ? ', ' : ''}{hero_year}
              </span>
            )}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-white tracking-tight leading-none">
            {displayTitle?.split(' ').map((word, i, arr) => (
              <span key={i}>
                {word}
                {i < arr.length - 1 && ' '}
                {i === Math.floor(arr.length / 2) - 1 && arr.length > 2 && <br />}
              </span>
            ))}
          </h1>
        </div>

        {hero_subtitle && (
          <div className="md:max-w-xs md:mb-2">
            <p className="text-white/80 text-sm font-light leading-relaxed">
              {hero_subtitle}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <Icon icon="solar:arrow-down-linear" width={20} />
              </button>
              <span className="text-white/60 text-xs">Scroll to explore</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
