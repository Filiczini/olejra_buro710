import { Icon } from '@iconify-icon/react';
import type { Project } from '../../types/project';

interface FooterSectionProps {
  nextProject?: Project;
  loadingNext?: boolean;
}

export default function FooterSection({ nextProject, loadingNext = false }: FooterSectionProps) {
  return (
    <footer className="bg-zinc-900 text-white py-24 border-t border-zinc-800">
      <div className="max-w-[1800px] mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">

        <div className="flex flex-col gap-8">
          <h3 className="text-2xl font-light tracking-tight">Bureau 710</h3>
          <div className="flex flex-col gap-2 text-sm text-zinc-400 font-light">
            <p>Architecture & Consulting</p>
            <p>Kyiv, Ukraine</p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4">
          <span className="text-xs uppercase tracking-widest text-zinc-500">Next Project</span>
          {loadingNext ? (
            <span className="text-2xl md:text-3xl font-light uppercase tracking-tight text-zinc-600">
              Loading...
            </span>
          ) : nextProject ? (
            <a
              href={`/project/${nextProject.id}`}
              className="group flex items-center gap-4 text-3xl md:text-5xl font-light uppercase tracking-tight hover:text-zinc-300 transition-colors"
            >
              {nextProject.title}
              <Icon
                icon="solar:arrow-right-linear"
                className="transform group-hover:translate-x-2 transition-transform duration-300"
                width={32}
                height={32}
              />
            </a>
          ) : (
            <span className="text-2xl md:text-3xl font-light uppercase tracking-tight text-zinc-600">
              No More Projects
            </span>
          )}
        </div>

      </div>
    </footer>
  );
}
