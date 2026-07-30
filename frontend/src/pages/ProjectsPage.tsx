import ProjectCard from '../components/projects/ProjectCard';
import { useFetchPosts } from '../hooks/useFetchPosts';

function pluralizeProjects(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'проєкт';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'проєкти';
  return 'проєктів';
}

export default function ProjectsPage() {
  const { posts, loading, error } = useFetchPosts({ status: 'published', limit: 100 });

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      <main className="pt-32 pb-24">
        <section className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-end mb-16 border-b border-zinc-200 pb-6">
            <h1 className="text-2xl md:text-h4 font-display tracking-tight text-zinc-900">
              Наші проєкти
            </h1>
            {!loading && (
              <span className="text-sm text-zinc-400 font-medium">
                {posts.length} {pluralizeProjects(posts.length)}
              </span>
            )}
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-6">
                  <div className="aspect-[4/3] bg-zinc-100 animate-pulse" />
                  <div className="flex flex-col gap-2">
                    <div className="h-3 bg-zinc-100 animate-pulse w-3/4" />
                    <div className="h-3 bg-zinc-100 animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16">
              <p className="text-zinc-500 mb-4">Не вдалося завантажити проєкти.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 transition-colors"
              >
                Спробувати знову
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <p className="text-zinc-400 text-sm">Проєктів поки немає.</p>
          )}

          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {posts.map((post) => (
                <ProjectCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
