import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import { useFetchPosts } from '../../hooks/useFetchPosts';

export default memo(function FeaturedPostsSection() {
  const { posts, loading, error } = useFetchPosts({ featured: true });

  if (loading || error || posts.length === 0) return null;

  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-40">
      <div className="flex justify-between items-end mb-16 pb-6 gap-12">
        <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
          Вибрані проєкти
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {posts.map((post) => (
          <Link key={post.id} to={`/page/${post.slug}`} className="group block">
            <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-zinc-100">
              {post.hero_image_url ? (
                <img
                  src={post.hero_image_url}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <Icon icon="solar:document-text-linear" width={48} />
                </div>
              )}
            </div>
            <div className="flex justify-between items-start opacity-70 group-hover:opacity-100 transition-opacity">
              <div>
                <h4 className="text-lg font-medium text-zinc-900">{post.title}</h4>
                {post.hero_tags && post.hero_tags.length > 0 && (
                  <p className="text-sm text-zinc-500 mt-1">{post.hero_tags[0]}</p>
                )}
              </div>
              <Icon
                icon="solar:arrow-right-linear"
                width={20}
                className="-rotate-45 group-hover:rotate-0 transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
});
