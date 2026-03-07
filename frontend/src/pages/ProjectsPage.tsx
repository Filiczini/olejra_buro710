import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { postService } from '../services/api';
import type { Post } from '../types/post';

export default function ProjectsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService
      .getAll({ status: 'published', limit: 100 })
      .then((res) => setPosts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      <Header />
      <main className="pt-32 pb-24">
        <section className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-end mb-16 border-b border-zinc-200 pb-6">
            <h1 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
              Всі Проєкти
            </h1>
            {!loading && (
              <span className="text-sm text-zinc-400 font-medium">{posts.length} проєктів</span>
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

          {!loading && posts.length === 0 && (
            <p className="text-zinc-400 text-sm">Проєктів поки немає.</p>
          )}

          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {posts.map((post) => {
                const meta = [post.hero_location, post.hero_year].filter(Boolean).join(', ');

                return (
                  <Link
                    key={post.id}
                    to={`/page/${post.slug}`}
                    className="group flex flex-col gap-6"
                  >
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
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
