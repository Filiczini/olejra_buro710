import { useEffect, useState, useCallback, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import ZoomableImage, { type ZoomableImageHandle } from './ZoomableImage';

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
  const zoomRef = useRef<ZoomableImageHandle>(null);

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

  /**
   * Slide transition. The track holds [prev, current, next]. After navigating, the new image
   * is already in the centre slot and the old one sits in a side slot, so we render one frame
   * shifted back to where the old image was (`pendingNav`) and then let the track glide to 0.
   * `fromPx` keeps the finger's drag offset so the swipe continues without a jump.
   */
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [pendingNav, setPendingNav] = useState<{ shift: number; fromPx: number } | null>(null);

  const navigate = useCallback(
    (dir: 'next' | 'prev', fromPx = 0) => {
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion && images.length > 1) {
        setPendingNav({ shift: dir === 'next' ? 100 : -100, fromPx });
      }
      setDragX(0);
      if (dir === 'next') onNext();
      else onPrev();
    },
    [images.length, onNext, onPrev]
  );

  const goNext = useCallback((fromPx?: number) => navigate('next', fromPx), [navigate]);
  const goPrev = useCallback((fromPx?: number) => navigate('prev', fromPx), [navigate]);

  useEffect(() => {
    if (!pendingNav) return;
    // Two frames: let the browser paint the start position before enabling the transition
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setPendingNav(null));
    });
    return () => cancelAnimationFrame(id);
  }, [pendingNav]);

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      goPrev();
    },
    [goPrev]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      goNext();
    },
    [goNext]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'ArrowRight':
          goNext();
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
    [handleClose, goPrev, goNext]
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
  const [zoomed, setZoomed] = useState(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // No swipe navigation while zoomed (one finger pans) or during a pinch
      touchStartX.current =
        zoomed || images.length < 2 || (e.touches && e.touches.length > 1)
          ? null
          : e.changedTouches[0].screenX;
    },
    [zoomed, images.length]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      if (zoomed || (e.touches && e.touches.length > 1)) {
        // A second finger landed: this is a pinch, not a swipe
        touchStartX.current = null;
        setDragging(false);
        setDragX(0);
        return;
      }
      setDragging(true);
      setDragX(e.changedTouches[0].screenX - touchStartX.current);
    },
    [zoomed]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      setDragging(false);
      if (touchStartX.current === null || zoomed) {
        touchStartX.current = null;
        setDragX(0);
        return;
      }
      const offset = e.changedTouches[0].screenX - touchStartX.current;
      touchStartX.current = null;
      const threshold = 50;
      if (offset < -threshold) {
        goNext(offset);
      } else if (offset > threshold) {
        goPrev(offset);
      } else {
        setDragX(0); // not far enough: spring back
      }
    },
    [goNext, goPrev, zoomed]
  );

  const hasNeighbours = images.length > 1;
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;

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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
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

      {/* Mobile: image spans the full width and the arrows sit on top of it */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          data-testid="lightbox-track"
          className="flex h-full will-change-transform"
          style={{
            transform: `translate3d(calc(${(hasNeighbours ? -100 : 0) + (pendingNav?.shift ?? 0)}% + ${pendingNav ? pendingNav.fromPx : dragX}px), 0, 0)`,
            transition:
              pendingNav || dragging ? 'none' : 'transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          {hasNeighbours && <NeighbourSlide src={images[prevIndex]} />}
          <div
            className="h-full w-full shrink-0 py-20 md:p-28"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <ZoomableImage
              ref={zoomRef}
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Зображення ${currentIndex + 1}`}
              onZoomChange={setZoomed}
              onBackdropClick={handleClose}
            />
          </div>
          {hasNeighbours && <NeighbourSlide src={images[nextIndex]} />}
        </div>
      </div>

      <button
        onClick={handlePrev}
        className={`absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-20 md:h-20 flex items-center justify-center rounded-full text-white bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:text-white/80 hover:text-white md:hover:bg-white/10 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer ${zoomed ? 'hidden' : 'opacity-80'}`}
        aria-label="Попереднє"
      >
        <Icon icon="solar:arrow-left-linear" className="text-2xl md:text-5xl" />
      </button>

      <button
        onClick={handleNext}
        className={`absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-20 md:h-20 flex items-center justify-center rounded-full text-white bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:text-white/80 hover:text-white md:hover:bg-white/10 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer ${zoomed ? 'hidden' : 'opacity-80'}`}
        aria-label="Наступне"
      >
        <Icon icon="solar:arrow-right-linear" className="text-2xl md:text-5xl" />
      </button>

      {/* Mobile magnifier: on desktop a click on the photo zooms instead */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          zoomRef.current?.toggleZoom();
        }}
        className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full text-white bg-black/40 backdrop-blur-sm cursor-pointer"
        aria-label={zoomed ? 'Зменшити' : 'Збільшити'}
      >
        <Icon
          icon={zoomed ? 'solar:magnifer-zoom-out-linear' : 'solar:magnifer-zoom-in-linear'}
          className="text-2xl"
        />
      </button>
    </div>
  );
}

/** Previous/next image beside the current one, visible while swiping and during the slide. */
function NeighbourSlide({ src }: { src: string }) {
  return (
    <div aria-hidden className="h-full w-full shrink-0 py-20 md:p-28">
      <div className="flex h-full w-full items-center justify-center">
        <img
          src={src}
          alt=""
          draggable={false}
          className="max-h-full max-w-full select-none object-contain"
        />
      </div>
    </div>
  );
}
