import type { ProjectImage } from '../../types/project';

interface ConceptSectionProps {
  title?: string;
  description: string[];
  images: ProjectImage[];
  features?: string[];
}

export default function ConceptSection({ title = 'Concept & Context', description, images, features }: ConceptSectionProps) {
  // Use main description paragraphs, limit to first 2 for concept section
  const conceptDescription = description.slice(0, 2);

  return (
    <section className="max-w-[1800px] mx-auto px-6 mb-32 md:mb-48">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
        {/* Left: Sticky Sidebar */}
        <div className="lg:col-span-5 sticky top-32">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6 block">{title}</span>
          <h3 className="text-4xl md:text-6xl font-normal uppercase tracking-tight text-zinc-900 mb-8 leading-[0.9]">
            Культурний <br /> Код
          </h3>
          <div className="w-12 h-[1px] bg-zinc-900 mb-8" />

          {conceptDescription.map((paragraph, index) => (
            <p key={index} className="text-base text-zinc-500 leading-relaxed text-justify mb-8">
              {paragraph}
            </p>
          ))}

          {features && features.length > 0 && (
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-900 flex-wrap">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-zinc-900' : 'bg-zinc-300'}`} />
                  {feature}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Images */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="aspect-[4/5] bg-zinc-100 overflow-hidden relative group">
            {images[0] && (
              <img
                src={images[0].url}
                alt={images[0].alt || ''}
                className="w-full h-full object-cover object-bottom transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute bottom-6 left-6 text-white bg-black/50 backdrop-blur-sm px-4 py-2 text-xs uppercase tracking-wide">
              Design Concept
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-zinc-100 overflow-hidden">
              {images[1] && (
                <img
                  src={images[1].url}
                  alt={images[1].alt || ''}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="aspect-square bg-zinc-100 overflow-hidden flex items-center justify-center p-8 bg-zinc-50">
              <p className="text-zinc-400 text-xs uppercase tracking-widest text-center leading-loose">
                "Ми поєднали матеріали та форми, щоб створити відчуття глибини простору."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
