import { useEffect, useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/project';
import { portfolioService } from '../../services/api';

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await portfolioService.getAll({ page, limit: 12 });
      setProjects(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [page]);

  if (loading) {
    return (
      <section className="max-w-[1800px] mx-auto px-6 py-24">
        <div className="text-center text-zinc-600">Loading projects...</div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="max-w-[1800px] mx-auto px-6 py-24">
        <div className="text-center text-zinc-600">No projects found</div>
      </section>
    );
  }

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24">
      <div className="flex justify-between items-end mb-16">
        <h3 className="text-xl font-medium tracking-tight">Вибрані проекти</h3>
        <Link 
          to="/admin/dashboard" 
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors hidden md:block"
        >
          Всі проекти ({projects.length})
        </Link>
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

      {totalPages > 1 && (
        <div className="mt-16 text-center">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(1, page - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors ${
                    pageNum === page ? 'bg-zinc-900 text-white' : ''
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center md:hidden">
        <Link 
          to="/admin/dashboard" 
          className="inline-block px-8 py-3 border border-zinc-200 rounded-full text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors"
        >
          Всі проекти
        </Link>
      </div>
    </section>
  );
}
