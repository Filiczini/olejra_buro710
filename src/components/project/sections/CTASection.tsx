/**
 * CTA (Call to Action) Section Component
 *
 * Displays heading, description, and action button.
 * Prompts user to take action.
 */

import { CTAContent } from '@/types';

interface CTASectionProps {
  content: CTAContent;
  translations?: Partial<CTAContent>;
}

export const CTASection: React.FC<CTASectionProps> = ({
  content,
  translations
}) => {
  const { title, description, button_text, button_url } = {
    ...content,
    ...translations
  };

  return (
    <section className="bg-zinc-50 py-32">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-8">
        <h2 className="text-3xl md:text-5xl font-light leading-tight text-zinc-900 tracking-tight">
          {title}
        </h2>

        {description && (
          <p className="text-base md:text-lg text-zinc-600 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}

        {button_text && button_url && (
          <a
            href={button_url}
            className="mt-4 px-8 py-4 bg-zinc-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-zinc-800 transition-colors"
          >
            {button_text}
          </a>
        )}
      </div>
    </section>
  );
};
