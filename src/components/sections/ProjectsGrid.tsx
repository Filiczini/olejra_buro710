import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  location: string;
  year: string;
  image: string;
}

export default function ProjectsGrid() {
  const projects: Project[] = [
    {
      id: 1,
      title: 'Stone House',
      location: 'Lviv',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2600&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Kyiv Modernist',
      location: 'Kyiv',
      year: '2022',
      image: 'https://images.unsplash.com/photo-1556912173-3db996ea8c3f?q=80&w=2600&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Golden Ray',
      location: 'Kyiv',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop',
    },
  ];

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24">
      <div className="flex justify-between items-end mb-16">
        <h3 className="text-xl font-medium tracking-tight">Вибрані проекти</h3>
        <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden md:block">Всі проекти (24)</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
        {projects.map((project, index) => (
          <Link 
            key={project.id} 
            to={`/project/${project.id}`} 
            className={`group block space-y-4 ${index === 1 ? 'md:mt-24' : ''}`}
          >
            <div className="relative overflow-hidden aspect-[4/5] bg-zinc-100">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
            <div className="flex justify-between items-start opacity-70 group-hover:opacity-100 transition-opacity">
              <div>
                <h4 className="text-lg font-medium text-zinc-900">{project.title}</h4>
                <p className="text-sm text-zinc-500 mt-1">{project.location} · {project.year}</p>
              </div>
              <Icon icon="solar:arrow-right-linear" width={20} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center md:hidden">
        <a href="#" className="inline-block px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors">
          Всі проекти
        </a>
      </div>
    </section>
  );
}
