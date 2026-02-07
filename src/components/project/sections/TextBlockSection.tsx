/**
 * Text Block Section Component
 *
 * Generic text block with optional title and multiple paragraphs.
 * Flexible typography.
 */

import { TextBlockContent } from '@/types';

interface TextBlockSectionProps {
  content: TextBlockContent;
  translations?: Partial<TextBlockContent>;
}

export const TextBlockSection: React.FC<TextBlockSectionProps> = ({
  content,
  translations
}) => {
  const { title, content: paragraphs } = { ...content, ...translations };

  return (
    <section className="max-w-4xl mx-auto px-6 py-32 md:py-48">
      {title && (
        <h2 className="text-3xl md:text-5xl font-light leading-tight text-zinc-900 tracking-tight mb-12">
          {title}
        </h2>
      )}

      {paragraphs && paragraphs.length > 0 && (
        <div className="space-y-8">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-base md:text-lg text-zinc-600 leading-relaxed font-light"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};
