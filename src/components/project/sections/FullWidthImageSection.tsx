/**
 * Full-Width Image Section Component
 *
 * Displays a full-width image with optional grayscale-to-color hover effect.
 * Customizable height.
 */

import { ImageBlockContent } from '@/types';

interface FullWidthImageSectionProps {
  content: ImageBlockContent;
  translations?: Partial<ImageBlockContent>;
}

export const FullWidthImageSection: React.FC<FullWidthImageSectionProps> = ({
  content,
  translations
}) => {
  const {
    image_url,
    caption,
    alt,
    height = '80vh',
    grayscale = true
  } = { ...content, ...translations };

  return (
    <section className="w-full bg-zinc-100 overflow-hidden mb-32">
      <div
        className={`w-full ${height} ${
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
        <div className="max-w-[1800px] mx-auto px-6 mt-4">
          <p className="text-xs text-zinc-400 uppercase tracking-widest">
            {caption}
          </p>
        </div>
      )}
    </section>
  );
};
