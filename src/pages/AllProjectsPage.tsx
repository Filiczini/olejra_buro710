import { useEffect, useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify-icon/react';
import { Link } from 'react-router-dom';
import type { Project } from '../types/project';
import { portfolioService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../config/translations';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function AllProjectsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Ref for intersection observer
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setPage(p => p + 1);
      }
    }, { threshold: 0.5, rootMargin: '100px' });

    if (node) observer.current.observe(node);
  }, [hasMore, loadingMore]);

  const loadProjects = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const filters: any = { page, limit: 6 };
      const result = await portfolioService.getAll(filters);

      if (isLoadMore) {
        setProjects(prev => [...prev, ...result.data]);
      } else {
        setProjects(result.data);
      }

      setTotal(result.pagination.total);
      setHasMore(page < result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
            <div className="text-center text-zinc-600">{t.project.loading}</div>
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
              {t.navigation.projects}
            </h1>
            <p className="text-zinc-600 text-lg">
              {total} {language === 'uk' ? 'проєктів' : 'projects'}
            </p>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-24 text-zinc-600">
              {t.dashboard.noProjects}
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
                        loading="lazy"
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

              {/* Loading More Indicator */}
              <div ref={loadMoreRef} className="flex justify-center py-12">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Icon icon="solar:spinner-linear" width={24} className="animate-spin" />
                    <span>{language === 'uk' ? 'Завантаження...' : 'Loading...'}</span>
                  </div>
                )}
                {!hasMore && projects.length > 0 && (
                  <p className="text-zinc-400 text-sm">
                    {language === 'uk' ? 'Всі проєкти показано' : 'All projects shown'}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
