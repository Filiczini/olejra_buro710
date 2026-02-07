/**
 * Tags Section Component
 *
 * Displays tags as pills or badges.
 * Optional title heading.
 */

import { TagsContent } from '@/types';

interface TagsSectionProps {
  content: TagsContent;
  translations?: Partial<TagsContent>;
}

export const TagsSection: React.FC<TagsSectionProps> = ({
  content,
  translations
}) => {
  const { title, tags } = { ...content, ...translations };

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-16 border-t border-zinc-200">
      {title && (
        <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
          {title}
        </h3>
      )}

      <div className="flex flex-wrap gap-3">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-zinc-100 text-zinc-700 text-xs font-medium uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
};
