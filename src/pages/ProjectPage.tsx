import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Project } from '../types/project';
import { portfolioService } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { Icon } from '@iconify-icon/react';

export default function ProjectPage() {
  const t = useTranslation();
  const projectTranslations = t.project || {};

  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNavVisible, setIsNavVisible] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const data = await portfolioService.getById(id!);
        setProject(data);
      } catch (err) {
        setError('Failed to load project');
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id]);

  const description = project?.shortDescription || project?.description?.[0] || '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-zinc-600">{projectTranslations.loading || 'Loading...'}</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-red-600">{error || (projectTranslations.notFound || 'Project not found')}</div>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-900 antialiased">
      {/* NAVIGATION: Absolute Overlay */}
      <nav className="fixed top-0 left-0 w-full z-50 mix-blend-difference text-white">
        <div className="w-full px-6 h-20 flex justify-between items-center">
          <a href="/" className="text-xs font-semibold tracking-tight uppercase hover:opacity-70 transition-opacity">
            Bureau 710
          </a>

          <button
            onClick={() => setIsNavVisible(!isNavVisible)}
            className="flex items-center gap-2 group"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
              Close
            </span>
            <Icon icon="solar:close-circle-linear" width={24} className="opacity-80 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </nav>

      {/* HERO SECTION: 100vh with Carousel + Overlay */}
      <header className="relative w-full h-[100vh] overflow-hidden bg-zinc-900">
        {/* CAROUSEL: Horizontal Snap Scroll */}
        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide z-0">
          {/* Slide 1 */}
          <div className="w-full h-full flex-shrink-0 snap-center relative">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>

        {/* Hint to scroll */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 mix-blend-difference hidden md:block animate-pulse pointer-events-none">
          <Icon icon="solar:arrow-right-linear" width={32} className="text-white/50" />
        </div>

        {/* CONTENT OVERLAY: Gradient + Text */}
        <div className="absolute bottom-0 left-0 w-full z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-32 pb-12 px-6">
          <div className="max-w-screen-xl mx-auto w-full">
            {/* Tags */}
            <div className="flex gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {project.tags?.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] font-medium uppercase tracking-wider text-white"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title & Meta Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* Title */}
              <div className="lg:col-span-8">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter text-white leading-[0.85] mb-4">
                  {project.title}
                </h1>
                <p className="text-lg md:text-xl font-light text-zinc-300 max-w-2xl leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Meta Data Columns */}
              <div className="lg:col-span-4 flex justify-start lg:justify-end gap-12 pb-2">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Client</span>
                  <span className="text-sm font-medium text-white">{project.location || 'TBD'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Year</span>
                  <span className="text-sm font-medium text-white">{project.year || 'TBD'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Area</span>
                  <span className="text-sm font-medium text-white">{project.area || 'TBD'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="bg-white text-zinc-900 pb-32">
        {/* SECTION: Intro Text & Gallery Grid */}
        <section className="max-w-screen-xl mx-auto px-6 pt-24 md:pt-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
            {/* Sticky Sidebar / Context */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-32 space-y-8">
                <span className="block w-8 h-[1px] bg-zinc-900 mb-6"></span>
                <h3 className="text-sm font-medium uppercase tracking-wide mb-4">The Challenge</h3>
                <p className="text-sm text-zinc-500 leading-6">
                  {description}
                </p>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
              <article className="text-xl md:text-2xl font-light leading-relaxed text-zinc-800 mb-16">
                {project.description.map((para, index) => (
                  <p key={index} className="mb-8">
                    {para}
                  </p>
                ))}
              </article>

              {/* Quote Block */}
              <blockquote className="relative pl-8 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <span className="absolute left-0 top-0 text-4xl text-zinc-300">"</span>
                <p className="text-3xl font-medium tracking-tight leading-tight text-zinc-900">
                  {description}
                </p>
              </blockquote>
            </div>
          </div>

          {/* SECTION: Full Width Image */}
          <div className="w-full aspect-[16/9] mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-widest mb-32 border-b border-zinc-100 pb-4">
            <span>Figure 01</span>
            <span>Main Dining Hall</span>
          </div>

          {/* SECTION: Secondary Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
            {/* Sticky Sidebar / Specs */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-32 space-y-8">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">Materials</h3>
                  <ul className="text-sm space-y-1 text-zinc-800">
                    {project.materials?.map((material, index) => (
                      <li key={index}>
                        {material.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">Team</h3>
                  <ul className="text-sm space-y-1 text-zinc-800">
                    {project.team && <li>{project.team}</li>}
                    {project.architects && <li>{project.architects}</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
              <h2 className="text-3xl font-medium tracking-tight mb-8">Context</h2>
              <p className="text-base text-zinc-600 leading-7 font-light mb-8">
                {description}
              </p>
              <p className="text-base text-zinc-600 leading-7 font-light mb-8">
                {description}
              </p>
            </div>
          </div>

          {/* SECTION: Masonry Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {project.projectImages?.slice(0, 5).map((img, index) => (
              <div key={index} className="space-y-4 md:space-y-8">
                <img
                  src={img.url}
                  alt={img.alt || project.title}
                  className="w-full h-auto object-cover rounded-sm"
                />
                <div className="p-8 bg-zinc-50 rounded-sm">
                  <Icon icon="solar:quote-up-square-linear" width={32} className="text-zinc-300 mb-4" />
                  <p className="text-sm font-medium text-zinc-900 leading-relaxed">
                    {img.caption || description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER: Next Project Navigation */}
      <footer className="bg-zinc-950 text-white py-32 px-6 border-t border-white/10">
        <div className="max-w-screen-xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 block">
            Other Projects
          </span>

          <div className="relative group border-t border-white/10 pt-12">
            <div className="absolute right-0 top-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-10 group-hover:translate-x-0 hidden md:block">
              <Icon icon="solar:arrow-right-linear" width={48} className="text-white" />
            </div>
            <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-zinc-400 group-hover:text-white transition-colors duration-300">
              Back to Portfolio
            </h2>
            <div className="mt-8 flex gap-4 text-sm text-zinc-500 font-normal">
              <span>View All Projects</span>
              <span>•</span>
              <span>Portfolio</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        /* Hide Scrollbar */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Reveal Animation */
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Custom Selection */
        ::selection {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
      `}</style>
    </div>
  );
}
