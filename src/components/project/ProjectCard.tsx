import { Link } from 'react-router-dom';
import type { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Generate category from tags if not provided
  const category = project.category_primary || (project.tags && project.tags[0]) || '';

  // Use short_description or first line of description
  const description = project.short_description || (project.description?.[0]) || '';

  // Build metadata string
  const metadataParts = [
    category,
    project.area,
    project.location,
    project.year
  ].filter(Boolean);
  const metadata = metadataParts.join(' · ');

  return (
    <Link
      to={`/project/${project.id}`}
      className="group flex flex-col gap-6 cursor-pointer"
    >
      {/* Project Image */}
      <div className="aspect-[4/3] bg-zinc-100 overflow-hidden w-full relative rounded-lg">
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0 rounded-lg"
        />
      </div>

      {/* Project Content */}
      <div className="flex flex-col gap-4 group-hover:translate-y-[-4px] transition-transform duration-300">
        {/* Project Title */}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 group-hover:text-zinc-700 transition-colors duration-300">
          {project.title}
        </h3>

        {/* Project Metadata */}
        {metadata && (
          <div className="text-xs text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors duration-300">
            {metadata}
          </div>
        )}

        {/* Project Description */}
        {description && (
          <p className="text-sm leading-relaxed text-zinc-500 text-justify mt-[0.625rem] group-hover:text-zinc-600 transition-colors duration-300">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
