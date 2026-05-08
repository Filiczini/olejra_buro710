import type { ImageFullData } from '@buro710/shared';

interface ImageFullBlockProps {
  data: ImageFullData;
}

export default function ImageFullBlock({ data }: ImageFullBlockProps) {
  const { image_url, alt, caption } = data;

  if (!image_url) return null;

  return (
    <section className="py-12 relative w-full h-[90vh] p-5vh overflow-hidden group">
      <div className="w-full h-full overflow-hidden">
        <img
          src={image_url}
          alt={alt || caption || ''}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    </section>
  );
}
