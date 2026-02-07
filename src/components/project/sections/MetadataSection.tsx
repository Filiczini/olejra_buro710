/**
 * Metadata Section Component
 *
 * Displays architectural specs (architects, area, location, year, photo_credits)
 * in a grid layout.
 */

import { MetadataSectionContent } from '@/types';

interface MetadataSectionProps {
  content: MetadataSectionContent;
  translations?: Partial<MetadataSectionContent>;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({
  content,
  translations
}) => {
  const {
    architects,
    area,
    location,
    year,
    photo_credits
  } = { ...content, ...translations };

  return (
    <section className="border-b border-zinc-100 bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
          {architects && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Architects
              </span>
              <span className="text-xs font-medium text-zinc-900">
                {architects}
              </span>
            </div>
          )}

          {area && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Area
              </span>
              <span className="text-xs font-medium text-zinc-900">
                {area}
              </span>
            </div>
          )}

          {location && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Location
              </span>
              <span className="text-xs font-medium text-zinc-900">
                {location}
              </span>
            </div>
          )}

          {year && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Year
              </span>
              <span className="text-xs font-medium text-zinc-900">
                {year}
              </span>
            </div>
          )}

          {photo_credits && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Photo Credits
              </span>
              <span className="text-xs font-medium text-zinc-900">
                {photo_credits}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
