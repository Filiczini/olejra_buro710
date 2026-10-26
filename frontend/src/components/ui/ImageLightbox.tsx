import { useEffect, useState, useCallback, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const closedRef = useRef(false);

  const handleClose = useCallback(() => {
    closedRef.current = false;
    setIsClosing(true);
  }, []);

  const finishClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
    setIsClosing(false);
  }, [onClose]);

  const handleAnimationEnd = useCallback(() => {
    if (isClosing) finishClose();
  }, [isClosing, finishClose]);

  // animationend never fires with reduced motion / disabled animations — close anyway
  useEffect(() => {
    if (!isClosing) return;
    const timer = setTimeout(finishClose, 400);
    return () => clearTimeout(timer);
  }, [isClosing, finishClose]);

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
        case 'Tab': {
          // Focus trap: keep Tab within lightbox
          const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) break;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
          break;
        }
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

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const diff = touchStartX.current - e.changedTouches[0].screenX;
      const threshold = 50;
      if (diff > threshold) {
        onNext();
      } else if (diff < -threshold) {
        onPrev();
      }
      touchStartX.current = null;
    },
    [onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus trap: focus the container so Tab stays within lightbox
    const prevFocus = document.activeElement as HTMLElement | null;
    containerRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      prevFocus?.focus();
    };
  }, [handleKeyDown]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Перегляд зображення"
      tabIndex={-1}
      className={`fixed inset-0 z-[70] group outline-none touch-none ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onAnimationEnd={handleAnimationEnd}
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 bg-black/95" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Закрити"
      >
        <Icon icon="solar:close-circle-linear" width={48} />
      </button>

      <div className="absolute top-6 left-6 text-white/60 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Попереднє"
      >
        <Icon icon="solar:arrow-left-linear" width={48} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Наступне"
      >
        <Icon icon="solar:arrow-right-linear" width={48} />
      </button>

      <div className="absolute inset-0 flex items-center justify-center p-16 md:p-28">
        <img
          src={images[currentIndex]}
          alt={`Зображення ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}
