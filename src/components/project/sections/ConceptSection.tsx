/**
 * Concept Section Component
 *
 * Two-column layout with sticky left sidebar and image gallery.
 * Displays concept heading, description, quote, and features.
 */

import React from 'react';
import { ConceptSectionContent } from '@/types';

interface ConceptSectionProps {
  content: ConceptSectionContent;
  translations?: Partial<ConceptSectionContent>;
}

export const ConceptSection: React.FC<ConceptSectionProps> = ({
  content,
  translations
}) => {
  const {
    heading,
    caption,
    description,
    quote,
    images,
    features
  } = { ...content, ...translations };

  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-32 md:mb-48">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
        {/* Left Column: Sticky Sidebar */}
        <div className="lg:col-span-5 sticky top-32">
          {caption && (
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6 block">
              {caption}
            </span>
          )}
          <h3 className="text-4xl md:text-6xl font-normal uppercase tracking-tight text-zinc-900 mb-8 leading-[0.9]">
            {heading}
          </h3>
          <div className="w-12 h-[1px] bg-zinc-900 mb-8"></div>

          {description && description.length > 0 && (
            <p className="text-base text-zinc-500 leading-relaxed text-justify mb-8">
              {description[0]}
            </p>
          )}

          {features && features.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-900">
              {features.map((feature, index) => (
                <React.Fragment key={index}>
                  <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
                  {feature}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Image */}
          {images && images.length > 0 && (
            <div className="aspect-[4/5] bg-zinc-100 overflow-hidden relative group">
              <img
                src={images[0].url}
                alt={images[0].alt || heading}
                className="w-full h-full object-cover object-bottom transition-transform duration-700 group-hover:scale-105"
              />
              {images[0].caption && (
                <div className="absolute bottom-6 left-6 text-white bg-black/50 backdrop-blur-sm px-4 py-2 text-xs uppercase tracking-wide">
                  {images[0].caption}
                </div>
              )}
            </div>
          )}

          {/* Secondary Images */}
          {images && images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {images.slice(1, 3).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-zinc-100 overflow-hidden"
                >
                  {image ? (
                    <img
                      src={image.url}
                      alt={image.alt || heading}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Quote box in place of second image */
                    <div className="flex items-center justify-center p-8 bg-zinc-50">
                      <p className="text-zinc-400 text-xs uppercase tracking-widest text-center leading-loose">
                        {quote || '"Ми поєднали вінтажні меблі з сучасними формами, щоб створити відчуття глибини часу."'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
