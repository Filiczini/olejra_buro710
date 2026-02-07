/**
 * Gallery Section Component
 *
 * Displays image gallery with grid or slider layout.
 * Supports autoplay for slider mode.
 */

import React from 'react';
import { GalleryContent } from '@/types';

interface GallerySectionProps {
  content: GalleryContent;
  translations?: Partial<GalleryContent>;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  content,
  translations
}) => {
  const {
    images,
    layout = 'grid',
    autoplay = false
  } = { ...content, ...translations };

  if (!images || images.length === 0) {
    return null;
  }

  if (layout === 'slider') {
    return <GallerySlider images={images} autoplay={autoplay} />;
  }

  return <GalleryGrid images={images} />;
};

interface GalleryGridProps {
  images: Array<{ url: string; caption?: string; alt?: string }>;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ images }) => {
  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square bg-zinc-100 overflow-hidden group"
          >
            <img
              src={image.url}
              alt={image.alt || image.caption || 'Gallery image'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-xs text-white uppercase tracking-widest">
                  {image.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

interface GallerySliderProps {
  images: Array<{ url: string; caption?: string; alt?: string }>;
  autoplay?: boolean;
}

const GallerySlider: React.FC<GallerySliderProps> = ({ images, autoplay }) => {
  // Simple slider implementation (can be enhanced with proper slider library)
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  React.useEffect(() => {
    if (autoplay) {
      const interval = setInterval(nextImage, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const currentImage = images[currentIndex];

  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-32 relative">
      <div className="aspect-[16/9] bg-zinc-100 overflow-hidden">
        <img
          src={currentImage.url}
          alt={currentImage.alt || currentImage.caption || 'Gallery image'}
          className="w-full h-full object-cover"
        />
        {currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <p className="text-sm text-white uppercase tracking-widest">
              {currentImage.caption}
            </p>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            ←
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            →
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
