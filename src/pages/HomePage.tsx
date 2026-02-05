import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSlider from '../components/sections/HeroSlider';
import AboutSection from '../components/sections/AboutSection';
import ProjectsGrid from '../components/sections/ProjectsGrid';
import PhilosophySection from '../components/sections/PhilosophySection';
import ProcessSection from '../components/sections/ProcessSection';
import CinematicDivider from '../components/sections/CinematicDivider';
import ContactCTA from '../components/sections/ContactCTA';

export default function HomePage() {
  return (
    <div className="bg-zinc-50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
      <Header />
      <main>
        <HeroSlider />
        <AboutSection />
        <ProjectsGrid />
        <PhilosophySection />
        <ProcessSection />
        <CinematicDivider />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
