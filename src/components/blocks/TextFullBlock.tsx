import type { TextFullData } from '../../types/block';

interface TextFullBlockProps {
  data: TextFullData;
}

export default function TextFullBlock({ data }: TextFullBlockProps) {
  const { content, label, area, months, year } = data;

  if (!content) return null;

  const hasStats = area || months || year;

  return (
    <section className="bg-white py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {label && (
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-6 block">
            {label}
          </span>
        )}
        
        <h2 className="text-2xl md:text-4xl font-normal tracking-tight text-zinc-900 mb-10 leading-snug">
          "{content}"
        </h2>
        
        {hasStats && (
          <div className="flex items-center justify-center gap-12 border-t border-zinc-100 pt-10">
            {area && (
              <div className="text-center">
                <span className="block text-2xl font-medium text-zinc-900">
                  {area}<span className="text-sm align-top text-zinc-400">m²</span>
                </span>
                <span className="text-xs text-zinc-400 uppercase tracking-wider mt-1 block">Area</span>
              </div>
            )}
            {months && (
              <div className="text-center">
                <span className="block text-2xl font-medium text-zinc-900">{months}</span>
                <span className="text-xs text-zinc-400 uppercase tracking-wider mt-1 block">Months</span>
              </div>
            )}
            {year && (
              <div className="text-center">
                <span className="block text-2xl font-medium text-zinc-900">{year}</span>
                <span className="text-xs text-zinc-400 uppercase tracking-wider mt-1 block">Year</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
