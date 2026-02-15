import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { portfolioService } from '../../services/api';
import type { Project } from '../../types/project';

export default function HeroSlider() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await portfolioService.getAll({ limit: 10, sortBy: 'created_at', sortOrder: 'desc' });
        const featuredProjects = response.data.filter(p => p.image_url).slice(0, 5);
        setProjects(featuredProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % projects.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [projects.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + projects.length) % projects.length);
  };

  if (loading || projects.length === 0) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-zinc-900 text-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-zinc-400">Завантаження...</div>
        </div>
      </section>
    );
  }

  const currentProject = projects[currentSlide];

  return (
    <header className="relative w-full h-screen overflow-hidden bg-zinc-900 text-white">
      <div className="relative w-full h-full">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className={`slide absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            data-index={index}
          >
            <div className="absolute inset-0 bg-zinc-800">
              <img
                src={project.image_url}
                alt={project.title}
                className={`w-full h-full object-cover opacity-90 transition-transform duration-[6000ms] ease-out ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30"></div>
            <div className="absolute bottom-0 w-full h-full px-6 md:px-10 pb-10 md:pb-14 flex flex-col justify-end">
              <div className="max-w-[1800px] mx-auto w-full flex flex-col md:flex-row items-end justify-between gap-10">
                <div className="w-full md:max-w-4xl">
                  <h1 className="text-5xl md:text-7xl lg:text-[88px] font-semibold tracking-tight leading-[0.9] mb-6">
                    {project.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm md:text-base font-medium text-white/80">
                    <span>{project.location || 'Локація'}</span>
                    {project.area && (
                      <>
                        <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                        <span>{project.area} м²</span>
                      </>
                    )}
                    {project.year && (
                      <>
                        <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                        <span>{project.year}</span>
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
                to={`/project/${currentProject.id}`}
                className="group hidden md:flex items-center gap-2 text-sm font-medium text-white hover:text-white transition-all duration-300 hover:opacity-80 cursor-pointer"
              >
Переглянути проект
                <Icon icon="solar:arrow-right-linear" width={16} className="transition-transform duration-300 group-hover:translate-x-3 group-hover:scale-110" />
              </Link>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white hover:scale-110 hover:shadow-lg hover:shadow-white/20 transition-all duration-300 backdrop-blur-sm group cursor-pointer"
                >
                  <Icon icon="solar:arrow-left-linear" width={16} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black hover:border-white hover:scale-110 hover:shadow-lg hover:shadow-white/20 transition-all duration-300 backdrop-blur-sm group cursor-pointer"
                >
                  <Icon icon="solar:arrow-right-linear" width={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
            <Link
              to={`/project/${currentProject.id}`}
              className="md:hidden flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-all duration-300 hover:opacity-80 cursor-pointer"
            >
              Переглянути проект <Icon icon="solar:arrow-right-linear" width={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
