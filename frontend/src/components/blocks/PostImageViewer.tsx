import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import ImageLightbox from '../ui/ImageLightbox';

type OpenImage = (src: string) => void;

const PostImageViewerContext = createContext<OpenImage | null>(null);

interface PostImageViewerProps {
  images: string[];
  children: ReactNode;
}

/** Lets content-block images open in the same lightbox as the gallery. */
export function PostImageViewer({ images, children }: PostImageViewerProps) {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback<OpenImage>(
    (src) => {
      const i = images.indexOf(src);
      if (i !== -1) setIndex(i);
    },
    [images]
  );

  const value = useMemo(() => (images.length > 0 ? open : null), [images.length, open]);

  return (
    <PostImageViewerContext.Provider value={value}>
      {children}
      {index !== null && (
        <ImageLightbox
          images={images}
          currentIndex={index}
          onClose={() => setIndex(null)}
          onPrev={() => setIndex((i) => ((i ?? 0) - 1 + images.length) % images.length)}
          onNext={() => setIndex((i) => ((i ?? 0) + 1) % images.length)}
        />
      )}
    </PostImageViewerContext.Provider>
  );
}

interface OpenImageButtonProps {
  src?: string;
  label?: string;
}

/**
 * Transparent button laid over an image (parent must be `relative`) that opens it in the
 * post lightbox. Renders nothing outside a PostImageViewer, so blocks stay static elsewhere.
 */
export function OpenImageButton({ src, label = 'Відкрити зображення' }: OpenImageButtonProps) {
  const open = useContext(PostImageViewerContext);
  if (!open || !src) return null;
  return (
    <button
      type="button"
      onClick={() => open(src)}
      aria-label={label}
      className="absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-900"
    />
  );
}
