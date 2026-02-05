import { useState } from 'react';
import { Icon } from '@iconify-icon/react';
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
  const [currentSlide, setCurrentSlide] = useState(0);

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

  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-zinc-900 text-white group">
      <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
        {projects.map((project, index) => (
          <Link 
            key={project.id} 
            to={`/project/${project.id}`}
            className="relative min-w-full h-full snap-center bg-noise cursor-pointer"
          >
            <img 
              src={project.image} 
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-16 flex flex-col md:flex-row md:items-end justify-between animate-reveal-up">
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
              <div className="hidden md:flex items-center gap-2 text-sm font-medium group/btn">
                <span>Переглянути проект</span>
                <Icon icon="solar:arrow-right-linear" width={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:flex items-center justify-center w-24 h-24 rounded-full border border-white/30 backdrop-blur-sm text-xs font-medium tracking-widest uppercase">
        Explore
      </div>

      <div className="absolute bottom-8 right-6 md:right-12 flex items-center gap-6 text-sm font-medium z-10">
        <div className="flex items-center gap-2">
          <span className="text-white">01</span>
          <div className="w-12 h-[1px] bg-white/30 relative">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-white"></div>
          </div>
          <span className="text-white/50">05</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
            <Icon icon="solar:arrow-left-linear" width={20} />
          </button>
          <button className="p-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
            <Icon icon="solar:arrow-right-linear" width={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
