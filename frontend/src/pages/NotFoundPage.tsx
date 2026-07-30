import { Link } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="pt-20">
        <section className="max-w-[1800px] mx-auto px-6 py-24 md:py-48 min-h-[calc(85vh)]">
          <div className="max-w-xl">
            <span className="text-xs font-medium text-zinc-400 tracking-widest uppercase mb-6 block">
              404
            </span>
            <h1 className="text-5xl md:text-h1 font-display tracking-tight leading-tight mb-8">
              Сторінку не знайдено.
            </h1>
            <p className="text-body text-zinc-500 leading-relaxed mb-12">
              Схоже, ця адреса не існує або була переміщена.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <Icon icon="solar:arrow-left-linear" width={18} />
              Повернутись на головну
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
