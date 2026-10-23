import type { ImageFullData } from '@buro710/shared';
import ResponsiveImage from '../ui/ResponsiveImage';

interface ImageFullBlockProps {
  data: ImageFullData;
}

export default function ImageFullBlock({ data }: ImageFullBlockProps) {
  const { image_url, alt, caption } = data;

  if (!image_url) return null;

  return (
    <section className="px-5 py-2 md:px-10 md:py-3">
      <figure className="group w-full overflow-hidden">
        <ResponsiveImage
          src={image_url}
          sizes="100vw"
          alt={alt || caption || ''}
          className="block w-full aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {caption && <figcaption className="pt-2 text-xs text-zinc-500">{caption}</figcaption>}
      </figure>
    </section>
  );
}
