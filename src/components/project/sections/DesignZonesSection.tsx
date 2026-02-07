/**
 * Design Zones Section Component
 *
 * Renders multiple design zones with various layouts.
 * Supports full-width, split, centered, and split-reverse layouts.
 */

import { DesignZonesSectionContent } from '@/types';

interface DesignZonesSectionProps {
  content: DesignZonesSectionContent;
  translations?: Partial<DesignZonesSectionContent>;
}

export const DesignZonesSection: React.FC<DesignZonesSectionProps> = ({
  content,
  translations
}) => {
  const { zones } = { ...content, ...translations };

  if (!zones || zones.length === 0) {
    return null;
  }

  return (
    <>
      {zones.map((zone, index) => (
        <DesignZone key={zone.id} zone={zone} index={index} />
      ))}
    </>
  );
};

interface DesignZoneProps {
  zone: {
    id: string;
    name: string;
    order: number;
    title: string;
    description: string;
    image_url?: string;
    layout?: 'full-width' | 'split' | 'centered' | 'split-reverse';
    features?: string[];
    alt?: string;
  };
  index: number;
}

const DesignZone: React.FC<DesignZoneProps> = ({ zone, index }) => {
  const layout = zone.layout || 'split';

  // Layout-specific rendering
  if (layout === 'full-width') {
    return (
      <section className="max-w-[1800px] mx-auto px-6 mb-40">
        <div className="w-full h-[70vh] bg-zinc-100 overflow-hidden">
          {zone.image_url && (
            <img
              src={zone.image_url}
              alt={zone.alt || zone.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </section>
    );
  }

  if (layout === 'centered') {
    return (
      <section className="max-w-[1800px] mx-auto px-6 mb-40">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2 block">
            Zone {index + 1}
          </span>
          <h2 className="text-4xl md:text-5xl font-light uppercase tracking-tight text-zinc-900 mb-6">
            {zone.title}
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">
            {zone.description}
          </p>
        </div>

        {zone.image_url && (
          <div className="w-full h-[70vh] bg-zinc-100 overflow-hidden relative group">
            <img
              src={zone.image_url}
              alt={zone.alt || zone.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        )}
      </section>
    );
  }

  // Split or Split-Reverse
  const isReverse = layout === 'split-reverse';
  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-40">
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${isReverse ? '' : ''}`}>
        {/* Image column */}
        <div className={`lg:col-span-7 ${isReverse ? 'order-1' : 'order-2'}`}>
          {zone.image_url && (
            <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
              <img
                src={zone.image_url}
                alt={zone.alt || zone.title}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          )}
        </div>

        {/* Content column */}
        <div className={`lg:col-span-5 ${isReverse ? 'order-2' : 'order-1'} flex flex-col justify-center`}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2 block">
            Zone {index + 1}
          </span>
          <h2 className="text-4xl md:text-5xl font-light uppercase tracking-tight text-zinc-900 mb-6">
            {zone.title}
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-8">
            {zone.description}
          </p>

          {zone.features && zone.features.length > 0 && (
            <ul className="flex flex-col gap-2 text-xs text-zinc-400 uppercase tracking-wide">
              {zone.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-base">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
