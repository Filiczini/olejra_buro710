import type { ThreeImagesData } from '@buro710/shared';

interface ThreeImagesBlockProps {
  data: ThreeImagesData;
}

export default function ThreeImagesBlock({ data }: ThreeImagesBlockProps) {
  const images = data.images ?? [];

  if (images.length === 0 || images.every((img) => !img.url)) return null;

  return (
    <section className="px-5 py-2 md:px-10 md:py-3">
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
        {images.map((image, index) =>
          image.url ? (
            <div key={`${image.url}-${index}`} className="overflow-hidden group">
              <img
                src={image.url}
                alt={image.alt || ''}
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          ) : null
        )}
      </div>
    </section>
  );
}
