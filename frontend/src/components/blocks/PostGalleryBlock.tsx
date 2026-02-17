import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import ImageLightbox from '../ui/ImageLightbox';

interface PostGalleryBlockProps {
  images: string[];
}

export default function PostGalleryBlock({ images }: PostGalleryBlockProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [images]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector('.gallery-item')?.clientWidth || 0;
    const gap = 24;
    const scrollAmount = (cardWidth + gap) * 3;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  
  const goPrev = () => setLightboxIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  
  const goNext = () => setLightboxIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-2xl font-medium tracking-tight text-zinc-900">Gallery</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 border border-zinc-200 rounded-full flex items-center justify-center transition-colors ${
              canScrollLeft ? 'hover:bg-zinc-100' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Previous images"
          >
            <Icon icon="solar:arrow-left-linear" width={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 border border-zinc-200 rounded-full flex items-center justify-center transition-colors ${
              canScrollRight ? 'hover:bg-zinc-100' : 'opacity-30 cursor-not-allowed'
            }`}
            aria-label="Next images"
          >
            <Icon icon="solar:arrow-right-linear" width={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => openLightbox(index)}
            className="gallery-item aspect-[2/3] min-w-[200px] md:min-w-[240px] md:max-w-[400px] bg-zinc-100 overflow-hidden group cursor-pointer flex-shrink-0"
          >
            <img
              src={image}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
