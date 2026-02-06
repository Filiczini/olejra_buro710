import { useState, useEffect } from 'react';

interface HeroSectionProps {
  title: string;
  category: string;
  shortDescription: string;
  backgroundImage: string;
}

export default function HeroSection({ title, category, shortDescription, backgroundImage }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxTransform = `translateY(${scrollY * 0.3}px)`;
  const scaleTransform = `scale(${1 + scrollY * 0.0002})`;

  return (
    <header className="relative w-full h-screen min-h-[800px] bg-zinc-900 overflow-hidden">
      {/* Background Image with parallax and zoom effect */}
      <div className="absolute inset-0 w-full h-full" style={{ transform: parallaxTransform }}>
        <img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover opacity-90"
          style={{ transform: scaleTransform, transition: 'transform 0.1s ease-out' }}
        />
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-12 flex flex-col md:flex-row justify-between items-end text-white z-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium tracking-[0.2em] uppercase opacity-70 mb-2">{category}</span>
          <h1 className="text-7xl md:text-9xl font-light tracking-tighter uppercase leading-none">
            {title}
          </h1>
        </div>
        <div className="hidden md:block max-w-xs text-right opacity-80">
          <p className="text-sm font-light leading-relaxed">
            {shortDescription}
          </p>
        </div>
      </div>
    </header>
  );
}
