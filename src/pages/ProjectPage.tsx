import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { Project, Media } from '../types/project';
import { portfolioService } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { Icon } from '@iconify-icon/react';
import Header from '../components/layout/Header';

export default function ProjectPage() {
  const t = useTranslation();

  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Generate images to display in hero slider
  const getHeroImages = (project: Project): string[] => {
    const images: string[] = [];

    if (!project) return images;

    // 1. Add heroMedia if available
    if (project.heroMedia && project.heroMedia.length > 0) {
      images.push(...project.heroMedia.map(m => m.url));
    }

    // 2. Fallback to galleryMedia[0] if no heroMedia
    if (images.length === 0 && project.galleryMedia && project.galleryMedia.length > 0) {
      images.push(project.galleryMedia[0].url);
    }

    // 3. Fallback to image_url if still no images
    if (images.length === 0 && project.image_url) {
      images.push(project.image_url);
    }

    // 4. Final fallback to placeholder
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80');
    }

    return images;
  };

  const heroImages = project ? getHeroImages(project) : [];

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const data = await portfolioService.getById(id!) as unknown as { project: Project; heroMedia: Media[]; galleryMedia: Media[] };
        setProject(data.project);
        setTotalSlides(getHeroImages(data.project).length);
      } catch (err) {
        setError('Failed to load project');
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  // Handle slide change via scroll
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

  const description = project?.short_description || project?.description?.[0] || '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-zinc-600">{t.project.loading || 'Loading...'}</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-red-600">{error || (t.project.notFound || 'Project not found')}</div>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-900 antialiased">
      <Header transparent={true} />

      {/* HERO SECTION: 100vh with Carousel + Overlay */}
      <header className="relative w-full h-[100vh] overflow-hidden bg-zinc-900">
        {/* CAROUSEL: Horizontal Snap Scroll */}
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

        {/* Navigation Arrows */}
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

        {/* Slide Indicators */}
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

        {/* CONTENT OVERLAY: Gradient + Text */}
        <div className="absolute bottom-0 left-0 w-full z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-32 pb-12 px-6">
          <div className="max-w-screen-xl mx-auto w-full">
            {/* Category & Tags */}
            <div className="flex gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {project.category && (
                <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-medium uppercase tracking-wider text-white">
                  {project.category}
                </span>
              )}
              {project.tags?.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] font-medium uppercase tracking-wider text-white"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title & Meta Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* Title */}
              <div className="lg:col-span-8">
                {project.subtitle && (
                  <p className="text-base md:text-lg font-light text-zinc-300 mb-2 leading-relaxed">
                    {project.subtitle}
                  </p>
                )}
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter text-white leading-[0.85] mb-4">
                  {project.title}
                </h1>
                <p className="text-lg md:text-xl font-light text-zinc-300 max-w-2xl leading-relaxed">
                  {project.short_description || description}
                </p>
              </div>

              {/* Meta Data Columns */}
              <div className="lg:col-span-4 flex justify-start lg:justify-end gap-12 pb-2">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                    {t.project.location || 'Location'}
                  </span>
                  <span className="text-sm font-medium text-white">{project.location || 'TBD'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                    {t.project.year || 'Year'}
                  </span>
                  <span className="text-sm font-medium text-white">{project.year || 'TBD'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                    {t.project.area || 'Area'}
                  </span>
                  <span className="text-sm font-medium text-white">{project.area || 'TBD'}</span>
                </div>
                {project.photo_credits && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      {t.project.photoCredits || 'Photo Credits'}
                    </span>
                    <span className="text-sm font-medium text-white">{project.photo_credits}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="bg-white text-zinc-900 pb-32">
        {/* SECTION: Intro Text & Gallery Grid */}
        <section className="max-w-screen-xl mx-auto px-6 pt-24 md:pt-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
            {/* Sticky Sidebar / Context */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-32 space-y-8">
                <span className="block w-8 h-[1px] bg-zinc-900 mb-6"></span>
                <h3 className="text-sm font-medium uppercase tracking-wide mb-4">
                  {project.challenge_title || 'The Challenge'}
                </h3>
                <p className="text-sm text-zinc-500 leading-6">
                  {project.challenge_description || description}
                </p>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
              <article className="text-xl md:text-2xl font-light leading-relaxed text-zinc-800 mb-16">
                {project.description.map((para, index) => (
                  <p key={index} className="mb-8">
                    {para}
                  </p>
                ))}
              </article>

              {/* Quote Block */}
              {project.quote_text && (
                <blockquote className="relative pl-8 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <span className="absolute left-0 top-0 text-4xl text-zinc-300">"</span>
                  <p className="text-3xl font-medium tracking-tight leading-tight text-zinc-900">
                    {project.quote_text}
                  </p>
                </blockquote>
              )}
            </div>
          </div>

          {/* SECTION: Full Width Image */}
          <div className="w-full aspect-[16/9] mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-widest mb-32 border-b border-zinc-100 pb-4">
            <span>{project.figure_number || 'Figure 01'}</span>
            <span>{project.figure_caption || 'Main Dining Hall'}</span>
          </div>

          {/* SECTION: Secondary Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
            {/* Sticky Sidebar / Specs */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-32 space-y-8">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">
                    {project.materials_title || 'Materials'}
                  </h3>
                  <ul className="text-sm space-y-1 text-zinc-800">
                    {project.materials?.map((material, index) => (
                      <li key={index}>
                        {material.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">Team</h3>
                  <ul className="text-sm space-y-1 text-zinc-800">
                    {project.team && <li>{project.team}</li>}
                    {project.architects && <li>{project.architects}</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
              <h2 className="text-3xl font-medium tracking-tight mb-8">
                {project.context_title || 'Context'}
              </h2>
              <p className="text-base text-zinc-600 leading-7 font-light mb-8">
                {project.context_description || description}
              </p>
              <p className="text-base text-zinc-600 leading-7 font-light mb-8">
                {project.description[1] || ''}
              </p>
            </div>
          </div>

          {/* SECTION: Masonry Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {(project.galleryMedia?.slice(0, 5) || project.project_images?.slice(0, 5) || []).map((img: any, index: number) => (
              <div key={index} className="space-y-4 md:space-y-8">
                <img
                  src={img.url}
                  alt={img.alt || project.title}
                  className="w-full h-auto object-cover rounded-sm"
                />
                <div className="p-8 bg-zinc-50 rounded-sm">
                  <Icon icon="solar:quote-up-square-linear" width={32} className="text-zinc-300 mb-4" />
                  <p className="text-sm font-medium text-zinc-900 leading-relaxed">
                    {img.caption || description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER: Next Project Navigation */}
      <footer className="bg-zinc-950 text-white py-32 px-6 border-t border-white/10">
        <div className="max-w-screen-xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 block">
            {project.other_projects_title || 'Other Projects'}
          </span>

          <div className="relative group border-t border-white/10 pt-12">
            <div className="absolute right-0 top-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-10 group-hover:translate-x-0 hidden md:block">
              <Icon icon="solar:arrow-right-linear" width={48} className="text-white" />
            </div>
            <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-zinc-400 group-hover:text-white transition-colors duration-300">
              {project.next_project_link_title || 'Back to Portfolio'}
            </h2>
            <div className="mt-8 flex gap-4 text-sm text-zinc-500 font-normal">
              <span>{project.next_project_link_subtitle || 'View All Projects'}</span>
              <span>•</span>
              <span>Portfolio</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        /* Hide Scrollbar */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Reveal Animation */
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Custom Selection */
        ::selection {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
      `}</style>
    </div>
  );
}
