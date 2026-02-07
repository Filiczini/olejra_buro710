/**
 * Image Block Section Component
 *
 * Displays a single image with optional caption and custom height.
 * Can be grayscale with color on hover.
 */

import { ImageBlockContent } from '@/types';

interface ImageBlockSectionProps {
  content: ImageBlockContent;
  translations?: Partial<ImageBlockContent>;
}

export const ImageBlockSection: React.FC<ImageBlockSectionProps> = ({
  content,
  translations
}) => {
  const {
    image_url,
    caption,
    alt,
    height = '80vh',
    grayscale = false
  } = { ...content, ...translations };

  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-32">
      <div
        className={`w-full ${height} bg-zinc-100 overflow-hidden ${
          grayscale ? 'grayscale hover:grayscale-0' : ''
        } transition-all duration-1000 ease-out`}
      >
        <img
          src={image_url}
          alt={alt || caption || 'Image'}
          className="w-full h-full object-cover"
        />
      </div>

      {caption && (
        <div className="max-w-4xl mx-auto mt-4">
          <p className="text-xs text-zinc-400 uppercase tracking-widest">
            {caption}
          </p>
        </div>
      )}
    </section>
  );
};
