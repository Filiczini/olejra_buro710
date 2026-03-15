import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { postService } from '../../services/api';
import { logger } from '../../lib/logger';
import type { Post } from '../../types/post';

const SLIDE_INTERVAL_MS = 6000;

export default function HeroSlider() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPosts = async () => {
      try {
        const response = await postService.getAll({ status: 'published', limit: 10 });
        if (cancelled) return;
        const featuredPosts = response.data.filter((p) => p.hero_image_url).slice(0, 5);
        setPosts(featuredPosts);
      } catch (err) {
        if (cancelled) return;
        logger.error('Failed to fetch posts', err);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % posts.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [posts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + posts.length) % posts.length);
  };

  if (loading) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-zinc-900 text-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-zinc-400">Завантаження...</div>
        </div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-zinc-900 text-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-4">Buro 710</h1>
            <p className="text-zinc-400 text-lg">Архітектура та дизайн</p>
          </div>
        </div>
      </section>
    );
  }

  const currentPost = posts[currentSlide];

  return (
    <header className="relative w-full h-screen overflow-hidden bg-zinc-900 text-white">
      <div className="relative w-full h-full">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`slide absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            data-index={index}
          >
            <div className="absolute inset-0 bg-zinc-800">
              <img
                src={post.hero_image_url}
                alt={post.hero_title || post.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                className={`w-full h-full object-cover opacity-90 transition-transform duration-[6000ms] ease-out ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30"></div>
            <div className="absolute bottom-0 w-full h-full px-6 md:px-10 pb-10 md:pb-14 flex flex-col justify-end">
              <div className="max-w-[1800px] mx-auto w-full flex flex-col md:flex-row items-end justify-between gap-10">
                <div className="w-full md:max-w-4xl">
                  <h1 className="text-5xl md:text-7xl lg:text-[88px] font-semibold tracking-tight leading-[0.9] mb-6">
                    {post.hero_title || post.title}
                  </h1>
                  <div className="hidden md:flex items-center gap-4 text-sm md:text-base font-medium text-white/80">
                    <span>{post.hero_location || 'Локація'}</span>
                    {post.hero_year && (
                      <>
                        <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                        <span>{post.hero_year}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 w-full px-6 md:px-10 pb-10 md:pb-14 pointer-events-none z-20">
        <div className="max-w-[1800px] mx-auto w-full flex justify-end">
          <div className="flex flex-col items-end gap-6 pointer-events-auto">
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold tracking-wide">
                {String(currentSlide + 1).padStart(2, '0')}
              </span>
              <div className="hidden md:block w-12 h-[1px] bg-white/30"></div>
              <Link
                to={`/page/${currentPost.slug}`}
                className="group hidden md:flex items-center gap-2 text-sm font-medium text-white hover:text-white transition-all duration-300 hover:opacity-80 cursor-pointer"
              >
                Переглянути пост
                <Icon
                  icon="solar:arrow-right-linear"
                  width={16}
                  className="transition-transform duration-300 group-hover:translate-x-3 group-hover:scale-110"
                />
              </Link>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={prevSlide}
                  aria-label="Попередній слайд"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white hover:scale-110 hover:shadow-lg hover:shadow-white/20 transition-all duration-300 backdrop-blur-sm group cursor-pointer"
                >
                  <Icon
                    icon="solar:arrow-left-linear"
                    width={16}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Наступний слайд"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white hover:scale-110 hover:shadow-lg hover:shadow-white/20 transition-all duration-300 backdrop-blur-sm group cursor-pointer"
                >
                  <Icon
                    icon="solar:arrow-right-linear"
                    width={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
            <Link
              to={`/page/${currentPost.slug}`}
              className="md:hidden flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-all duration-300 hover:opacity-80 cursor-pointer"
            >
              Переглянути пост{' '}
              <Icon
                icon="solar:arrow-right-linear"
                width={16}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
