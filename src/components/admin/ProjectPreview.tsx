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
  description: string[];
  challengeTitle?: string;
  challengeDescription?: string;
  quoteText?: string;
  contextTitle?: string;
  contextDescription?: string;
  materialsTitle?: string;
  materials?: Array<{ name: string; color?: string; type?: string }>;
  team?: string;
  architects?: string;
  figureNumber?: string;
  figureCaption?: string;
  galleryMedia?: File[] | string[];
  nextProjectLinkTitle?: string;
  nextProjectLinkSubtitle?: string;
  otherProjectsTitle?: string;
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
  description = [],
  challengeTitle,
  challengeDescription,
  quoteText,
  contextTitle,
  contextDescription,
  materialsTitle,
  materials = [],
  team,
  architects,
  figureNumber,
  figureCaption,
  galleryMedia = [],
  nextProjectLinkTitle,
  nextProjectLinkSubtitle,
  otherProjectsTitle,
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
      <div className="w-full h-[calc(100vh-200px)] bg-zinc-100 flex items-center justify-center">
        <p className="text-lg text-zinc-500">Preview will appear here</p>
      </div>
    );
  }

  const getGalleryImageUrls = (): string[] => {
    const urls: string[] = [];
    for (const media of galleryMedia) {
      if (media instanceof File) {
        urls.push(URL.createObjectURL(media));
      } else if (typeof media === 'string') {
        urls.push(media);
      }
    }
    return urls;
  };

  const galleryUrls = getGalleryImageUrls();

  const displayDescription = description.length > 0 ? description[0] : shortDescription || '';

  return (
    <div className="w-full h-[calc(100vh-200px)] overflow-y-auto bg-zinc-50">
      <style>{`
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
        .preview-text-scale {
          font-size: 0.9em;
        }
      `}</style>

      <div className="max-w-[1800px] mx-auto bg-white">
        {/* HERO SECTION */}
        <header className="relative w-full h-[70vh] min-h-[500px] bg-zinc-900 overflow-hidden">
          <div className="w-full h-full relative">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="absolute bottom-0 left-0 w-full z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-24 pb-8 px-4 md:px-6">
            <div className="max-w-screen-xl mx-auto w-full">
              <div className="flex gap-2 md:gap-3 mb-4 md:mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {category && (
                  <span className="px-2 md:px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[8px] md:text-[10px] font-medium uppercase tracking-wider text-white">
                    {category}
                  </span>
                )}
                {tags?.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 md:px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[8px] md:text-[10px] font-medium uppercase tracking-wider text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="lg:col-span-8">
                  {subtitle && (
                    <p className="text-sm md:text-base font-light text-zinc-300 mb-1 md:mb-2 leading-relaxed preview-text-scale">
                      {subtitle}
                    </p>
                  )}
                  <h1 className="text-4xl md:text-6xl lg:text-8xl font-medium tracking-tighter text-white leading-[0.9] mb-2 md:mb-4">
                    {title}
                  </h1>
                  <p className="text-sm md:text-lg font-light text-zinc-300 max-w-2xl leading-relaxed preview-text-scale">
                    {shortDescription}
                  </p>
                </div>

                <div className="lg:col-span-4 flex justify-start lg:justify-end gap-4 md:gap-8 lg:gap-12 pb-1">
                  <div>
                    <span className="block text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      Location
                    </span>
                    <span className="text-xs md:text-sm font-medium text-white preview-text-scale">{location || 'TBD'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      Year
                    </span>
                    <span className="text-xs md:text-sm font-medium text-white preview-text-scale">{year || 'TBD'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      Area
                    </span>
                    <span className="text-xs md:text-sm font-medium text-white preview-text-scale">{area || 'TBD'}</span>
                  </div>
                  {photoCredits && (
                    <div>
                      <span className="block text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                        Photo Credits
                      </span>
                      <span className="text-xs md:text-sm font-medium text-white preview-text-scale">{photoCredits}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* METADATA BLOCK */}
        <section className="border-b border-zinc-100 bg-white py-4 md:py-6">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] md:text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Architects
                </span>
                <span className="text-[10px] md:text-xs font-medium text-zinc-900 preview-text-scale">
                  {architects || 'Bureau 710'}
                </span>
              </div>

              {area && (
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] md:text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Area
                  </span>
                  <span className="text-[10px] md:text-xs font-medium text-zinc-900 preview-text-scale">{area}</span>
                </div>
              )}

              {location && (
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] md:text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Location
                  </span>
                  <span className="text-[10px] md:text-xs font-medium text-zinc-900 preview-text-scale">{location}</span>
                </div>
              )}

              {year && (
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] md:text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Year
                  </span>
                  <span className="text-[10px] md:text-xs font-medium text-zinc-900 preview-text-scale">{year}</span>
                </div>
              )}

              {photoCredits && (
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] md:text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Photo Credits
                  </span>
                  <span className="text-[10px] md:text-xs font-medium text-zinc-900 preview-text-scale">{photoCredits}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <main className="bg-white text-zinc-900 py-16 md:py-24">
          {/* CHALLENGE SECTION */}
          <section className="max-w-screen-xl mx-auto px-4 md:px-6 mb-16 md:mb-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4 lg:col-span-3">
                <div className="space-y-4 md:space-y-8">
                  <span className="block w-6 md:w-8 h-[1px] bg-zinc-900 mb-4 md:mb-6"></span>
                  <h3 className="text-xs md:text-sm font-medium uppercase tracking-wide mb-2 md:mb-4 preview-text-scale">
                    {challengeTitle || 'The Challenge'}
                  </h3>
                  <p className="text-xs md:text-sm text-zinc-500 leading-relaxed md:leading-6">
                    {challengeDescription || displayDescription}
                  </p>
                </div>
              </div>

              <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
                <article className="text-base md:text-xl lg:text-2xl font-light leading-relaxed text-zinc-800 mb-8 md:mb-16 preview-text-scale">
                  {description.map((para, index) => (
                    <p key={index} className="mb-4 md:mb-8">{para}</p>
                  ))}
                </article>

                {quoteText && (
                  <blockquote className="relative pl-6 md:pl-8 mb-8 md:mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <span className="absolute left-0 top-0 text-3xl md:text-4xl text-zinc-300">"</span>
                    <p className="text-xl md:text-3xl font-medium tracking-tight leading-tight text-zinc-900 preview-text-scale">
                      {quoteText}
                    </p>
                  </blockquote>
                )}
              </div>
            </div>
          </section>

          {/* FULL WIDTH IMAGE */}
          <div className="w-full aspect-[16/9] mb-2 md:mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>

          <div className="max-w-screen-xl mx-auto px-4 md:px-6 flex justify-between items-center text-[8px] md:text-[10px] text-zinc-400 uppercase tracking-widest mb-16 md:mb-32 border-b border-zinc-100 pb-2 md:pb-4">
            <span>{figureNumber || 'Figure 01'}</span>
            <span>{figureCaption || 'Main Dining Hall'}</span>
          </div>

          {/* SECONDARY CONTENT GRID */}
          <section className="max-w-screen-xl mx-auto px-4 md:px-6 mb-16 md:mb-32">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-4 lg:col-span-3">
                <div className="space-y-6 md:space-y-8">
                  {materialsTitle && materials.length > 0 && (
                    <div>
                      <h3 className="text-[10px] md:text-xs font-semibold uppercase text-zinc-400 mb-2">
                        {materialsTitle}
                      </h3>
                      <ul className="text-xs md:text-sm space-y-1 text-zinc-800">
                        {materials.map((material, index) => (
                          <li key={index}>{material.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(team || architects) && (
                    <div>
                      <h3 className="text-[10px] md:text-xs font-semibold uppercase text-zinc-400 mb-2">Team</h3>
                      <ul className="text-xs md:text-sm space-y-1 text-zinc-800">
                        {team && <li>{team}</li>}
                        {architects && <li>{architects}</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
                <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-4 md:mb-8 preview-text-scale">
                  {contextTitle || 'Context'}
                </h2>
                <p className="text-sm md:text-base text-zinc-600 leading-6 md:leading-7 font-light mb-4 md:mb-8 preview-text-scale">
                  {contextDescription || displayDescription}
                </p>
                {description.length > 1 && (
                  <p className="text-sm md:text-base text-zinc-600 leading-6 md:leading-7 font-light mb-4 md:mb-8 preview-text-scale">
                    {description[1]}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* MASONRY GALLERY */}
          {galleryUrls.length > 0 && (
            <section className="max-w-screen-xl mx-auto px-4 md:px-6 mb-16 md:mb-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 lg:gap-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                {galleryUrls.slice(0, 5).map((url, index) => (
                  <div key={index} className="space-y-3 md:space-y-6 lg:space-y-8">
                    <img
                      src={url}
                      alt={`${title} - ${index + 1}`}
                      className="w-full h-auto object-cover rounded-sm"
                    />
                    {index < 3 && (
                      <div className="p-4 md:p-8 bg-zinc-50 rounded-sm">
                        <p className="text-xs md:text-sm font-medium text-zinc-900 leading-relaxed preview-text-scale">
                          {displayDescription}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* FOOTER */}
        <footer className="bg-zinc-950 text-white py-16 md:py-24 px-4 md:px-6 border-t border-white/10">
          <div className="max-w-screen-xl mx-auto">
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 md:mb-4 block">
              {otherProjectsTitle || 'Other Projects'}
            </span>

            <div className="relative group border-t border-white/10 pt-8 md:pt-12">
              <div className="absolute right-0 top-8 md:top-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-8 md:translate-x-10 group-hover:translate-x-0 hidden md:block">
                <div className="text-3xl md:text-5xl text-white">→</div>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-medium tracking-tighter text-zinc-400 group-hover:text-white transition-colors duration-300 preview-text-scale">
                {nextProjectLinkTitle || 'Back to Portfolio'}
              </h2>
              <div className="mt-4 md:mt-8 flex gap-2 md:gap-4 text-xs md:text-sm text-zinc-500 font-normal">
                <span>{nextProjectLinkSubtitle || 'View All Projects'}</span>
                <span>•</span>
                <span>Portfolio</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
