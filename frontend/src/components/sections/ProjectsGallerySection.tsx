import { memo, useState } from 'react';
import ProjectCard from '../projects/ProjectCard';
import { useFetchPosts } from '../../hooks/useFetchPosts';

const INITIAL_COUNT = 3;

export default memo(function ProjectsGallerySection() {
  const { posts, loading, error } = useFetchPosts({ featured: true });
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  if (loading || error || posts.length === 0) return null;

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-40">
      <h2 className="text-2xl md:text-h3 font-display tracking-tight text-zinc-900 text-center mb-16">
        Вам може сподобатись
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {visiblePosts.map((post) => (
          <ProjectCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-16">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + INITIAL_COUNT)}
            className="px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors cursor-pointer"
          >
            Показати ще
          </button>
        </div>
      )}
    </section>
  );
});
