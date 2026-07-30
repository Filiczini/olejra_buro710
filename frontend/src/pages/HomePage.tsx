import HeroSlider from '../components/sections/HeroSlider';
import AboutSection from '../components/sections/AboutSection';
import StatsSection from '../components/sections/StatsSection';
import ProcessSection from '../components/sections/ProcessSection';
import ProjectsGallerySection from '../components/sections/ProjectsGallerySection';
import FAQSection from '../components/sections/FAQSection';
import CinematicDivider from '../components/sections/CinematicDivider';

export default function HomePage() {
  return (
    <div className="bg-zinc-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
      <main>
        <HeroSlider />
        <AboutSection />
        <StatsSection />
        <ProcessSection />
        <ProjectsGallerySection />
        <FAQSection />
        <CinematicDivider />
      </main>
    </div>
  );
}
