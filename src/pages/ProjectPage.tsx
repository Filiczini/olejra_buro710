import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/project/HeroSection';
import MetadataBlock from '../components/project/MetadataBlock';
import AboutSection from '../components/project/AboutSection';
import FullWidthImage from '../components/project/FullWidthImage';
import ConceptSection from '../components/project/ConceptSection';
import DesignZonesSection from '../components/project/DesignZonesSection';
import FooterSection from '../components/project/FooterSection';
import type { Project, ProjectImage } from '../types/project';
import { portfolioService } from '../services/api';
import { generateCategory, generateDesignZones, generateMaterials } from '../utils/projectGenerators';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [nextProject, setNextProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const data = await portfolioService.getById(id!);
        setProject(data);

        // Load next project
        setLoadingNext(true);
        const next = await portfolioService.getNextProject(id!);
        setNextProject(next);
        setLoadingNext(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-zinc-600">Loading...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-lg text-red-600">{error || 'Project not found'}</div>
      </div>
    );
  }

  // Generate category if not provided
  const category = project.category || generateCategory(project.tags).full;

  // Generate design zones if not provided
  const designZones = project.design_zones && project.design_zones.length > 0
    ? project.design_zones
    : generateDesignZones(project);

  // Generate project images if not provided
  const projectImages: ProjectImage[] = project.project_images && project.project_images.length > 0
    ? project.project_images
    : [{ url: project.image_url, alt: project.title }];

  // Generate features from design zones if available
  const features = designZones[0]?.features || [];

  return (
    <div className="bg-white text-zinc-900 antialiased">
      <Header />

      <main>
        {/* 1. Hero Section */}
        <HeroSection
          title={project.title}
          category={category}
          shortDescription={project.short_description || project.description[0]}
          backgroundImage={project.image_url}
        />

        {/* 2. Metadata Block */}
        <MetadataBlock
          area={project.area}
          location={project.location}
          year={project.year}
          photoCredits={project.photo_credits || project.team || "Bureau 710"}
        />

        {/* 3. About Section */}
        <AboutSection
          title={project.subtitle}
          description={project.description}
          icon="solar:sun-fog-linear"
        />

        {/* 4. Full Width Image */}
        <FullWidthImage
          imageUrl={project.image_url}
          alt={project.title}
        />

        {/* 5. Concept Section */}
        {project.description.length > 0 && (
          <ConceptSection
            title="Concept & Context"
            description={project.description}
            images={projectImages}
            features={features}
          />
        )}

        {/* 6. Design Zones Section */}
        {designZones.length > 0 && (
          <DesignZonesSection zones={designZones} />
        )}

        {/* 7. Footer Section */}
        <FooterSection nextProject={nextProject || undefined} loadingNext={loadingNext} />
      </main>

      <Footer />
    </div>
  );
}
