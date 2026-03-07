import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { postService } from '../../services/api';
import type { Post } from '../../types/post';

export default function ProjectsGallerySection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService
      .getFeatured()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="max-w-[1600px] mx-auto px-6 mb-40">
      <div className="flex justify-between items-end mb-16 border-b border-zinc-200 pb-6">
        <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
          Вибрані Проєкти
        </h2>
        <Link
          to="/projects"
          className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Всі проєкти{' '}
          <Icon icon="lucide:arrow-right" className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {posts.map((post) => {
          const meta = [post.hero_location, post.hero_year].filter(Boolean).join(', ');

          return (
            <Link key={post.id} to={`/page/${post.slug}`} className="group flex flex-col gap-6">
              <div className="aspect-[4/3] bg-zinc-100 overflow-hidden w-full relative">
                {post.hero_image_url ? (
                  <img
                    src={post.hero_image_url}
                    alt={post.title}
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
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                    {post.hero_title || post.title}
                  </h3>
                  {meta && <div className="text-xs text-zinc-500 font-medium">{meta}</div>}
                  {post.hero_tags && post.hero_tags.length > 0 && (
                    <div className="text-xs text-zinc-800 mt-2 font-medium">
                      {post.hero_tags[0]}
                    </div>
                  )}
                </div>
                {post.hero_subtitle && (
                  <p className="text-sm leading-relaxed text-zinc-500 text-justify">
                    {post.hero_subtitle}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
