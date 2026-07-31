import { Link } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import type { Post } from '@buro710/shared';

interface ProjectCardProps {
  post: Post;
}

export default function ProjectCard({ post }: ProjectCardProps) {
  const meta = [post.hero_location, post.hero_year].filter(Boolean).join(', ');

  return (
    <Link
      to={`/page/${post.slug}`}
      aria-label={`Переглянути проєкт: ${post.hero_title || post.title}`}
      className="group flex flex-col gap-6"
    >
      <div className="aspect-[4/3] bg-zinc-100 overflow-hidden w-full relative">
        {post.hero_image_url ? (
          <img
            src={post.hero_image_url}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <Icon icon="solar:document-text-linear" width={48} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-medium text-zinc-900">{post.hero_title || post.title}</h3>
          {meta && <div className="text-xs text-zinc-500 font-medium">{meta}</div>}
          {post.hero_tags && post.hero_tags.length > 0 && (
            <div className="text-xs text-zinc-800 mt-2 font-medium">
              {post.hero_tags.join(', ')}
            </div>
          )}
        </div>
        {post.hero_subtitle && (
          <p className="text-sm leading-relaxed text-zinc-500 text-justify">{post.hero_subtitle}</p>
        )}
      </div>
    </Link>
  );
}
