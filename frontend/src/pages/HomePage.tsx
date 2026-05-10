import HeroSlider from '../components/sections/HeroSlider';
import AboutSection from '../components/sections/AboutSection';
import PhilosophySection from '../components/sections/PhilosophySection';
import ProcessSection from '../components/sections/ProcessSection';
import CinematicDivider from '../components/sections/CinematicDivider';
import ContactCTA from '../components/sections/ContactCTA';
import ProjectsGallerySection from '../components/sections/ProjectsGallerySection';

export default function HomePage() {
  return (
    <div className="bg-zinc-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
      <main>
        <HeroSlider />
        <AboutSection />
        <ProjectsGallerySection />
        <PhilosophySection />
        <ProcessSection />
        <CinematicDivider />
        <ContactCTA />
      </main>
    </div>
  );
}
