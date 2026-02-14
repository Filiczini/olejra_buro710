import type { ImageFullData } from '../../types/block';

interface ImageFullBlockProps {
  data: ImageFullData;
}

export default function ImageFullBlock({ data }: ImageFullBlockProps) {
  const { image_url, alt, caption } = data;

  if (!image_url) return null;

  return (
    <section className="relative w-full h-[80vh] overflow-hidden group">
      <div className="w-full h-full overflow-hidden">
        <img
          src={image_url}
          alt={alt || caption || ''}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      {caption && (
        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full bg-gradient-to-t from-black/60 to-transparent">
          <div className="max-w-7xl mx-auto flex justify-between items-end">
            <span className="text-white text-xl font-medium tracking-tight">{caption}</span>
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
