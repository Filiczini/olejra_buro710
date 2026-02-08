import { Icon } from '@iconify-icon/react';
import { useTranslation } from '../../hooks/useTranslation';

export default function AboutSection() {
  const t = useTranslation();

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-32 border-b border-zinc-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
        <div>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight leading-tight animate-reveal-up">
            {t.about.heroLine1} <br className="hidden md:block" />
            {t.about.heroLine2} <br className="hidden md:block" />
            {t.about.heroLine3}
          </h2>
        </div>
        <div className="space-y-8 flex flex-col justify-between">
          <div className="space-y-6 text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
            <p>
              {t.about.description1}
            </p>
            <p>
              {t.about.description2}
            </p>
          </div>
          <div>
            <a href="#" className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider border-b border-zinc-900 pb-1 hover:opacity-60 transition-opacity">
              {t.about.ctaButton}
              <Icon icon="solar:arrow-right-up-linear" width={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
