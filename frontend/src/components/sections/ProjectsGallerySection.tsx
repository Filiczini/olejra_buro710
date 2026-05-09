import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import ProjectCard from '../projects/ProjectCard';
import { useFetchPosts } from '../../hooks/useFetchPosts';

export default memo(function ProjectsGallerySection() {
  const { posts, loading, error } = useFetchPosts({ featured: true });

  if (loading || error || posts.length === 0) return null;

  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-40">
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
        {posts.map((post) => (
          <ProjectCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
});
