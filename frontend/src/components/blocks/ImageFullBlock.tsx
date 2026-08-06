import type { ImageFullData } from '@buro710/shared';

interface ImageFullBlockProps {
  data: ImageFullData;
}

export default function ImageFullBlock({ data }: ImageFullBlockProps) {
  const { image_url, alt, caption } = data;

  if (!image_url) return null;

  return (
    <section className="px-5 py-6 md:px-10 md:py-10">
      <figure className="group w-full overflow-hidden">
        <img
          src={image_url}
          alt={alt || caption || ''}
          className="block w-full aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {caption && <figcaption className="pt-2 text-xs text-zinc-500">{caption}</figcaption>}
      </figure>
    </section>
  );
}
