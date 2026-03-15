import type { ThreeImagesData } from '../../types/block';

interface ThreeImagesBlockProps {
  data: ThreeImagesData;
}

export default function ThreeImagesBlock({ data }: ThreeImagesBlockProps) {
  const { images } = data;

  if (!images || images.every((img) => !img.url)) return null;

  return (
    <section className="py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {images.map((image) =>
          image.url ? (
            <div key={image.url} className="overflow-hidden group">
              <img
                src={image.url}
                alt={image.alt || ''}
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ) : null
        )}
      </div>
    </section>
  );
}
