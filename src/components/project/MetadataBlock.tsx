import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../config/translations';

interface MetadataBlockProps {
  area?: string;
  location?: string;
  year?: string;
  photoCredits?: string;
  architects?: string;
}

export default function MetadataBlock({ area, location, year, photoCredits, architects }: MetadataBlockProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const project = t.project || {};

  return (
    <section className="border-b border-zinc-100 bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              {project.architects || 'Architects'}
            </span>
            <span className="text-xs font-medium text-zinc-900">
              {architects || 'Bureau 710'}
            </span>
          </div>

          {area && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {project.area || 'Area'}
              </span>
              <span className="text-xs font-medium text-zinc-900">{area}</span>
            </div>
          )}

          {location && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {project.location || 'Location'}
              </span>
              <span className="text-xs font-medium text-zinc-900">{location}</span>
            </div>
          )}

          {year && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {project.year || 'Year'}
              </span>
              <span className="text-xs font-medium text-zinc-900">{year}</span>
            </div>
          )}

          {photoCredits && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {project.photoCredits || 'Photo Credits'}
              </span>
              <span className="text-xs font-medium text-zinc-900">{photoCredits}</span>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

