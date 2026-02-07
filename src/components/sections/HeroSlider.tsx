import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  location: string;
  area?: string;
  year: string;
  image: string;
}

export default function HeroSlider() {
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const slideWidthRef = useRef<number>(0);

  const projects: Project[] = [
    {
      id: 1,
      title: 'Golden Ray Residence',
      location: 'Київ, Україна',
      area: '145 м²',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2600&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Onyx Penthouse',
      location: 'Київ, Україна',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2600&auto=format&fit=crop',
    },
  ];

  // Extracted scroll logic to reusable function
  const scrollToSlide = useCallback((index: number) => {
    if (sliderRef.current) {
      const slideWidth = slideWidthRef.current || sliderRef.current.clientWidth;
      sliderRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    }
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (currentSlide + 1) % projects.length;
      setCurrentSlide(nextIndex);
      scrollToSlide(nextIndex);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentSlide - 1 + projects.length) % projects.length;
      setCurrentSlide(prevIndex);
      scrollToSlide(prevIndex);
    }
  }, [currentSlide, projects.length, scrollToSlide]);

  // Auto-scroll with interval
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % projects.length;
      setCurrentSlide(nextSlide);
      scrollToSlide(nextSlide);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, currentSlide, projects.length, scrollToSlide]);

  // Manual scroll handling - detect user-initiated scrolling and pause
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleScroll = () => {
      const scrollLeft = slider.scrollLeft;
      const newIndex = Math.round(scrollLeft / slider.clientWidth);
      setCurrentSlide(newIndex);
      setIsPaused(true);
    };

    slider.addEventListener('scroll', handleScroll);
    return () => slider.removeEventListener('scroll', handleScroll);
  }, []);

  // Resume auto-scroll after delay when paused
  useEffect(() => {
    if (!isPaused) return;
    const timeout = setTimeout(() => setIsPaused(false), 10000);
    return () => clearTimeout(timeout);
  }, [isPaused]);

  // Calculate and cache slide width on mount and resize
  useEffect(() => {
    const calculateSlideWidth = () => {
      if (sliderRef.current) {
        slideWidthRef.current = sliderRef.current.clientWidth;
      }
    };

    calculateSlideWidth();
    window.addEventListener('resize', calculateSlideWidth);
    return () => window.removeEventListener('resize', calculateSlideWidth);
  }, []);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-zinc-900 text-white">
      <div
        ref={sliderRef}
        role="region"
        aria-label="Featured projects carousel"
        aria-live="polite"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="flex h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar scroll-smooth focus:outline-none"
      >
        {projects.map((project, index) => (
          <Link
            key={project.id}
            to={`/project/${project.id}`}
            role="article"
            aria-label={`${project.title}, ${project.location}, ${project.year}`}
            tabIndex={currentSlide === index ? 0 : -1}
            className="relative min-w-full h-full snap-center bg-noise cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/20 focus:ring-inset"
          >
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-16 flex flex-col md:flex-row md:items-end justify-between">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-7xl font-medium tracking-tight">{project.title}</h2>
                <div className="flex items-center gap-3 text-zinc-300 text-sm md:text-base">
                  <span>{project.location}</span>
                  {project.area && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                      <span>{project.area}</span>
                    </>
                  )}
                  <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                  <span>{project.year}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
