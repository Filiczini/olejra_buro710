import { Icon } from '@iconify-icon/react';

interface AboutSectionProps {
  title?: string;
  description: string[];
  icon?: string;
}

export default function AboutSection({ title, description, icon = 'solar:sun-fog-linear' }: AboutSectionProps) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-32 md:py-48 flex flex-col gap-12 text-center">
      <div className="flex justify-center mb-4">
        <Icon icon={icon} className="text-zinc-400" width={32} height={32} />
      </div>

      {title && (
        <h2 className="text-3xl md:text-5xl font-light leading-tight text-zinc-900 tracking-tight">
          {title}
        </h2>
      )}

      {description.map((paragraph, index) => (
        <p key={index} className="text-base md:text-lg text-zinc-500 leading-loose font-light max-w-2xl mx-auto">
          {paragraph}
        </p>
      ))}
    </section>
  );
}
