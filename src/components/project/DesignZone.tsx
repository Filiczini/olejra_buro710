import type { DesignZone } from '../../types/project';
import { Icon } from '@iconify-icon/react';

interface DesignZoneProps {
  zone: DesignZone;
  zoneNumber: number;
}

export default function DesignZone({ zone, zoneNumber }: DesignZoneProps) {
  const renderLayout = () => {
    switch (zone.layout) {
      case 'full-width':
        return (
          <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
            {zone.image_url ? (
              <img
                src={zone.image_url}
                alt={zone.alt || zone.title}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300">
                No Image
              </div>
            )}
          </div>
        );

      case 'split-reverse':
        return (
          <>
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
                {zone.image_url ? (
                  <img
                    src={zone.image_url}
                    alt={zone.alt || zone.title}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    No Image
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-center">
              <ZoneContent zone={zone} zoneNumber={zoneNumber} />
            </div>
          </>
        );

      case 'centered':
        return (
          <>
            <div className="flex flex-col items-center text-center mb-16">
              <ZoneContent zone={zone} zoneNumber={zoneNumber} centered />
            </div>

            <div className="w-full h-[70vh] bg-zinc-100 overflow-hidden relative group">
              {zone.image_url ? (
                <img
                  src={zone.image_url}
                  alt={zone.alt || zone.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                  No Image
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          </>
        );

      case 'split':
      default:
        return (
          <>
            <div className="lg:col-span-7">
              <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
                {zone.image_url ? (
                  <img
                    src={zone.image_url}
                    alt={zone.alt || zone.title}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    No Image
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center">
              <ZoneContent zone={zone} zoneNumber={zoneNumber} />
            </div>
          </>
        );
    }
  };

  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-32 md:mb-40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {renderLayout()}
      </div>
    </section>
  );
}

function ZoneContent({ zone, zoneNumber, centered = false }: { zone: DesignZone; zoneNumber: number; centered?: boolean }) {
  return (
    <>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2 block">
        Zone {zoneNumber.toString().padStart(2, '0')}
      </span>
      <h2 className={`text-4xl md:text-5xl font-light uppercase tracking-tight text-zinc-900 ${centered ? 'mb-6' : 'mb-6'}`}>
        {zone.title}
      </h2>
      {!centered && zone.features && zone.features.length > 0 && (
        <ul className="flex flex-col gap-2 text-xs text-zinc-400 uppercase tracking-wide mb-8">
          {zone.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Icon icon="solar:leaf-linear" width={16} />
              {feature}
            </li>
          ))}
        </ul>
      )}
      <p className={`text-sm text-zinc-500 leading-relaxed ${centered ? 'max-w-lg' : ''}`}>
        {zone.description}
      </p>
    </>
  );
}
