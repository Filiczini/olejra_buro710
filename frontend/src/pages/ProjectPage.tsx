import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { Project, Media } from '../types/project';
import { portfolioService } from '../services/api';
import { Icon } from '@iconify-icon/react';
import Header from '../components/layout/Header';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [heroMedia, setHeroMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getHeroImages = (project: Project, media: Media[]): string[] => {
    const images: string[] = [];

    if (media.length > 0) {
      images.push(...media.map(m => m.url));
    }

    if (images.length === 0 && project.image_url) {
      images.push(project.image_url);
    }

    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80');
    }

    return images;
  };

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await portfolioService.getById(id) as unknown as { 
          project: Project; 
          heroMedia: Media[]; 
        };
        setProject(data.project);
        setHeroMedia(data.heroMedia || []);
      } catch (err) {
        setError('Помилка завантаження проекту');
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const heroImages = project ? getHeroImages(project, heroMedia) : [];
  const totalSlides = heroImages.length;

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const slideWidth = slider.offsetWidth;
      const slideIndex = Math.round(slider.scrollLeft / slideWidth);
      setCurrentSlide(slideIndex);
    };

    slider.addEventListener('scroll', handleScroll);
    return () => slider.removeEventListener('scroll', handleScroll);
  }, [heroImages.length]);

  const scrollToSlide = (index: number) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const slideWidth = slider.offsetWidth;
    slider.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
  };

  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % totalSlides;
    scrollToSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    scrollToSlide(newIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-zinc-600">Завантаження...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-red-600">{error || 'Проект не знайдено'}</div>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-900 antialiased">
      <Header transparent={true} />

      <header className="relative w-full h-[100vh] overflow-hidden bg-zinc-900">
        <div
          ref={sliderRef}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide z-0 scroll-smooth"
        >
          {heroImages.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 snap-center relative">
              <img
                src={image}
                alt={`${project.title} - Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ))}
        </div>

        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-md text-white mix-blend-difference hover:bg-black/50 transition-all duration-300 hidden md:block"
              aria-label="Previous slide"
            >
              <Icon icon="solar:arrow-left-linear" width={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-md text-white mix-blend-difference hover:bg-black/50 transition-all duration-300 hidden md:block"
              aria-label="Next slide"
            >
              <Icon icon="solar:arrow-right-linear" width={24} />
            </button>
          </>
        )}

        {totalSlides > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-32 pb-12 px-6">
          <div className="max-w-screen-xl mx-auto w-full">
            <div className="flex gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {project.tags?.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-medium uppercase tracking-wider text-white"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="lg:col-span-8">
                {project.subtitle && (
                  <p className="text-base md:text-lg font-light text-zinc-300 mb-2 leading-relaxed">
                    {project.subtitle}
                  </p>
                )}
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter text-white leading-[0.85] mb-4">
                  {project.title}
                </h1>
              </div>

              <div className="lg:col-span-4 flex justify-start lg:justify-end gap-12 pb-2">
                {project.location && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      Локація
                    </span>
                    <span className="text-sm font-medium text-white">{project.location}</span>
                  </div>
                )}
                {project.year && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      Рік
                    </span>
                    <span className="text-sm font-medium text-white">{project.year}</span>
                  </div>
                )}
                {project.area && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      Площа
                    </span>
                    <span className="text-sm font-medium text-white">{project.area} м²</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-white text-zinc-900 py-24">
        <div className="max-w-screen-xl mx-auto px-6">
          <p className="text-zinc-600 text-center">
            Контент проекту буде додано пізніше...
          </p>
        </div>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        ::selection {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
      `}</style>
    </div>
  );
}
