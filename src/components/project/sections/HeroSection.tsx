/**
 * Hero Section Component
 *
 * Full-screen hero with dynamic content, parallax effects, and optional CTA.
 * Now fully editable via admin panel!
 */

import type { HeroSectionContent } from '@/types';

interface HeroSectionProps {
  content: HeroSectionContent;
  translations?: Partial<HeroSectionContent>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  content,
  translations
}) => {
  const {
    image_url,
    overlay_color = 'from-black/30 via-transparent to-black/60',
    parallax_enabled = true,
    title,
    subtitle,
    short_description,
    layout = 'centered',
    animation_type = 'zoom',
    cta_button
  } = { ...content, ...translations };

  // Animation classes based on type
  const getAnimationClass = () => {
    switch (animation_type) {
      case 'zoom':
        return 'animate-[pulse_10s_ease-in-out_infinite_alternate] hover:scale-110';
      case 'fade':
        return 'animate-fade-in';
      case 'slide':
        return 'animate-slide-up';
      default:
        return '';
    }
  };

  // Layout classes
  const getLayoutClass = () => {
    switch (layout) {
      case 'left':
        return 'items-start';
      case 'right':
        return 'items-end text-right';
      case 'split':
        return 'md:items-end';
      default:
        return 'items-center';
    }
  };

  return (
    <header className="relative w-full h-screen min-h-[800px] bg-zinc-900 overflow-hidden">
      {/* Background Image */}
      <div className={`absolute inset-0 w-full h-full ${parallax_enabled ? 'parallax' : ''}`}>
        <img
          src={image_url}
          alt={title}
          className={`w-full h-full object-cover opacity-90 transition-transform duration-[20s] ${getAnimationClass()}`}
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b ${overlay_color}`}></div>
      </div>

      {/* Content */}
      <div className={`absolute bottom-0 left-0 w-full p-6 md:p-12 pb-12 flex flex-col md:flex-row justify-between items-end text-white z-10 ${getLayoutClass()}`}>
        <div className="flex flex-col gap-2">
          {subtitle && (
            <span className="text-xs font-medium tracking-[0.2em] uppercase opacity-70 mb-2">
              {subtitle}
            </span>
          )}
          <h1 className="text-7xl md:text-9xl font-light tracking-tighter uppercase leading-none">
            {title}
          </h1>
          {short_description && (
            <p className="text-sm font-light leading-relaxed mt-4 opacity-80">
              {short_description}
            </p>
          )}

          {/* Optional CTA Button */}
          {cta_button && (
            <button
              onClick={() => window.open(cta_button.url, '_blank')}
              className={`mt-6 px-8 py-3 uppercase tracking-wider hover:opacity-80 transition-opacity ${
                cta_button.style === 'primary'
                  ? 'bg-white text-zinc-900'
                  : 'border border-white text-white'
              }`}
            >
              {cta_button.text}
            </button>
          )}
        </div>

        {/* Split layout: description on right */}
        {short_description && layout === 'split' && (
          <div className="hidden md:block max-w-xs text-right opacity-80">
            <p className="text-sm font-light leading-relaxed">
              {short_description}
            </p>
          </div>
        )}
      </div>
    </header>
  );
};
