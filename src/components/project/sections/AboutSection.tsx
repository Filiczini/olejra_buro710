/**
 * About Section Component
 *
 * Text block with icon, subtitle, and description paragraphs.
 * Centered layout with atmospheric typography.
 */

import { AboutSectionContent } from '@/types';

interface AboutSectionProps {
  content: AboutSectionContent;
  translations?: Partial<AboutSectionContent>;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  content,
  translations
}) => {
  const {
    icon,
    subtitle,
    title,
    description
  } = { ...content, ...translations };

  return (
    <section className="max-w-4xl mx-auto px-6 py-32 md:py-48 flex flex-col gap-12 text-center">
      {icon && (
        <div className="flex justify-center mb-4">
          <span className="text-zinc-400">
            {/* Icon rendering - assuming iconify-icon */}
            <img
              src={`https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js`}
              alt=""
              className="hidden"
            />
            <span className="inline-block" data-icon={icon} />
          </span>
        </div>
      )}

      <h2 className="text-3xl md:text-5xl font-light leading-tight text-zinc-900 tracking-tight">
        {title}
      </h2>

      {description && description.length > 0 && (
        <div className="space-y-4">
          {description.map((paragraph, index) => (
            <p
              key={index}
              className="text-base md:text-lg text-zinc-500 leading-loose font-light max-w-2xl mx-auto"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};
