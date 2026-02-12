import { useEffect, useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';
import type { Project } from '../types/project';
import { portfolioService } from '../services/api';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function AllProjectsPage() {

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadProjects = async () => {
    try {
      setLoading(true);

      const filters: any = { page, limit: 6 };
      const result = await portfolioService.getAll(filters);

      setProjects(result.data);
      setTotal(result.pagination.total);
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
      <div className="min-h-screen bg-zinc-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-[1800px] mx-auto px-6 py-24">
            <div className="text-center text-zinc-600">Завантаження...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <div className="pt-20">
        <div className="max-w-[1800px] mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
              Проєкти
            </h1>
            <p className="text-zinc-600 text-lg">
              {total} проєктів
            </p>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-24 text-zinc-600">
              Немає проєктів
            </div>
          ) : (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 mb-16">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="group block space-y-4 break-inside-avoid mb-6"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-zinc-200 rounded-full hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    Попередня
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-full transition-all duration-200 text-sm font-medium ${
                          page === pageNum
                            ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                            : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-zinc-200 rounded-full hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  >
                    Наступна
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
