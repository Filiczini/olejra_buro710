import { useEffect, useState, useCallback } from 'react';
import { Icon } from '@iconify-icon/react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: ImageLightboxProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    if (isClosing) {
      onClose();
      setIsClosing(false);
    }
  }, [isClosing, onClose]);

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPrev();
    },
    [onPrev]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onNext();
    },
    [onNext]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    },
    [handleClose, onPrev, onNext]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  return (
    <div
      className={`fixed inset-0 z-[70] group ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onAnimationEnd={handleAnimationEnd}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/95" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
        aria-label="Закрити"
      >
        <Icon icon="solar:close-circle-linear" width={32} />
      </button>

      <div className="absolute top-6 left-6 text-white/60 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Попереднє"
      >
        <Icon icon="solar:arrow-left-linear" width={32} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Наступне"
      >
        <Icon icon="solar:arrow-right-linear" width={32} />
      </button>

      <div className="absolute inset-0 flex items-center justify-center p-16">
        <img
          src={images[currentIndex]}
          alt={`Зображення ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}
