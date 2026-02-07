import { useEffect, useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/project';
import { portfolioService } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';

export default function ProjectsGrid() {
  const { language } = useLanguage();
  const t = translations[language];

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await portfolioService.getAll({ page: 1, limit: 3 });
      setProjects(result.data);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <section className="max-w-[1800px] mx-auto px-6 py-24">
        <div className="text-center text-zinc-600">{t.project.loading}</div>
      </section>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24">
      <div className="flex justify-between items-end mb-16">
        <h3 className="text-xl font-medium tracking-tight">
          {language === 'uk' ? 'Вибрані проєкти' : 'Featured Projects'}
        </h3>
        <Link
          to="/projects"
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden md:inline-flex items-center gap-2"
        >
          {language === 'uk' ? 'Всі проєкти' : 'All Projects'} ({total})
          <Icon icon="solar:arrow-right-linear" width={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16 mb-12">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            to={`/project/${project.id}`}
            className={`group block space-y-4 ${index === 1 ? 'md:mt-24' : ''}`}
          >
            <div className="relative overflow-hidden aspect-[4/5] bg-zinc-100">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex justify-between items-start opacity-70 group-hover:opacity-100 transition-opacity">
              <div>
                <h4 className="text-lg font-medium text-zinc-900">{project.title}</h4>
                <p className="text-sm text-zinc-500 mt-1">
                  {project.location} {project.year && `· ${project.year}`}
                </p>
              </div>
              <Icon icon="solar:arrow-right-linear" width={20} className="-rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile "View All" button */}
      <div className="text-center md:hidden">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors"
        >
          {language === 'uk' ? 'Всі проєкти' : 'All Projects'} ({total})
          <Icon icon="solar:arrow-right-linear" width={18} />
        </Link>
      </div>
    </section>
  );
}
