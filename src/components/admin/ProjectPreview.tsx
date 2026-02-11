import { useEffect, useState } from 'react';

interface ProjectPreviewProps {
  heroImage?: File | string;
  title: string;
  subtitle?: string;
  shortDescription?: string;
  category?: string;
  tags: string[];
  location?: string;
  year?: string;
  area?: string;
  photoCredits?: string;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80';

export default function ProjectPreview({
  heroImage,
  title,
  subtitle,
  shortDescription,
  category,
  tags,
  location,
  year,
  area,
  photoCredits,
}: ProjectPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>(PLACEHOLDER_IMAGE);

  useEffect(() => {
    let url: string | undefined;

    if (heroImage instanceof File) {
      url = URL.createObjectURL(heroImage);
      setImageUrl(url);
    } else if (typeof heroImage === 'string' && heroImage) {
      setImageUrl(heroImage);
    } else {
      setImageUrl(PLACEHOLDER_IMAGE);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [heroImage]);

  if (!title) {
    return (
      <div className="w-full h-[100vh] bg-zinc-100 flex items-center justify-center">
        <p className="text-lg text-zinc-500">Preview will appear here</p>
      </div>
    );
  }

  return (
    <header className="relative w-full h-[100vh] overflow-hidden bg-zinc-900">
      <div className="w-full h-full relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="absolute bottom-0 left-0 w-full z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-32 pb-12 px-6">
        <div className="max-w-screen-xl mx-auto w-full">
          <div className="flex gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {category && (
              <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-medium uppercase tracking-wider text-white">
                {category}
              </span>
            )}
            {tags?.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] font-medium uppercase tracking-wider text-white"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="lg:col-span-8">
              {subtitle && (
                <p className="text-base md:text-lg font-light text-zinc-300 mb-2 leading-relaxed">
                  {subtitle}
                </p>
              )}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter text-white leading-[0.85] mb-4">
                {title}
              </h1>
              <p className="text-lg md:text-xl font-light text-zinc-300 max-w-2xl leading-relaxed">
                {shortDescription}
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end gap-12 pb-2">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                  Location
                </span>
                <span className="text-sm font-medium text-white">{location || 'TBD'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                  Year
                </span>
                <span className="text-sm font-medium text-white">{year || 'TBD'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                  Area
                </span>
                <span className="text-sm font-medium text-white">{area || 'TBD'}</span>
              </div>
              {photoCredits && (
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                    Photo Credits
                  </span>
                  <span className="text-sm font-medium text-white">{photoCredits}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
