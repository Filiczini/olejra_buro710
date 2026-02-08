import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { portfolioService } from '../../services/api';
import type { Project } from '../../types/project';
import ProjectCard from '../project/ProjectCard';

export default function FeaturedProjectsSection() {
  const t = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await portfolioService.getAll({ limit: 6, sortBy: 'created_at', sortOrder: 'desc' });
        setProjects(response.data);
      } catch (err) {
        console.error('Failed to load featured projects:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="max-w-[1600px] mx-auto px-6 mb-40">
        <div className="flex justify-between items-end mb-16 pb-6">
          <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
            {t.home.featuredProjects}
          </h2>
        </div>
        <div className="text-center py-24 text-zinc-500">
          {t.home.loading}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-[1600px] mx-auto px-6 mb-40">
        <div className="flex justify-between items-end mb-16 pb-6">
          <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
            {t.home.featuredProjects}
          </h2>
        </div>
        <div className="text-center py-24 text-zinc-500">
          {t.home.error}
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="max-w-[1600px] mx-auto px-6 mb-40">
        <div className="flex justify-between items-end mb-16 pb-6">
          <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
            {t.home.featuredProjects}
          </h2>
        </div>
        <div className="text-center py-24 text-zinc-500">
          {t.home.noProjects}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto px-6 mb-40">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-16 pb-6">
        <h2 className="text-4xl font-medium tracking-tight uppercase text-zinc-900">
          {t.home.featuredProjects}
        </h2>
        <Link
          to="/projects"
          className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {t.home.viewAll}
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
