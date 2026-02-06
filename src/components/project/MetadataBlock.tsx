interface MetadataBlockProps {
  area?: string;
  location?: string;
  year?: string;
  photoCredits?: string;
}

export default function MetadataBlock({ area, location, year, photoCredits }: MetadataBlockProps) {
  return (
    <section className="border-b border-zinc-100 bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Architects</span>
            <span className="text-xs font-medium text-zinc-900">Bureau 710</span>
          </div>

          {area && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Area</span>
              <span className="text-xs font-medium text-zinc-900">{area}</span>
            </div>
          )}

          {location && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Location</span>
              <span className="text-xs font-medium text-zinc-900">{location}</span>
            </div>
          )}

          {year && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Year</span>
              <span className="text-xs font-medium text-zinc-900">{year}</span>
            </div>
          )}

          {photoCredits && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Photo Credits</span>
              <span className="text-xs font-medium text-zinc-900">{photoCredits}</span>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
