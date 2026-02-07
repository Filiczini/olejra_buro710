import { Icon } from '@iconify-icon/react';
import type { Project } from '@/types/project';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/config/translations';

interface FooterSectionProps {
  nextProject?: Project;
  loadingNext?: boolean;
  companyName?: string;
  companyTagline?: string;
  companyLocation?: string;
}

export default function FooterSection({
  nextProject,
  loadingNext = false,
  companyName = 'Bureau 710',
  companyTagline = 'Architecture & Consulting',
  companyLocation = 'Kyiv, Ukraine'
}: FooterSectionProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const project = t.project || {};

  return (
    <footer className="bg-zinc-900 text-white py-24 border-t border-zinc-800">
      <div className="max-w-[1800px] mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">

        <div className="flex flex-col gap-8">
          <h3 className="text-2xl font-light tracking-tight">{companyName}</h3>
          <div className="flex flex-col gap-2 text-sm text-zinc-400 font-light">
            <p>{companyTagline}</p>
            <p>{companyLocation}</p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4">
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            {project.nextProject || 'Next Project'}
          </span>
          {loadingNext ? (
            <span className="text-2xl md:text-3xl font-light uppercase tracking-tight text-zinc-600">
              {project.loading || 'Loading...'}
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
              {project.noMoreProjects || 'No More Projects'}
            </span>
          )}
        </div>

      </div>
    </footer>
  );
}

