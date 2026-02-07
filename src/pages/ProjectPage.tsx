import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { SectionRenderer } from '../components/project/SectionRenderer';
import FooterSection from '../components/project/sections/FooterSection';
import type { Project } from '../types/project';
import type { ProjectSection } from '../types/sections';
import { portfolioService, siteSettingsService } from '../services/api';
import { generateCategory, generateDesignZones } from '../utils/projectGenerators';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../config/translations';
import { createDefaultSectionContent, getSectionDefaultTitle } from '../types/sections';

export default function ProjectPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const projectTranslations = t.project || {};

  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [nextProject, setNextProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState('');
  const [siteSettings, setSiteSettings] = useState({
    company_name: 'Bureau 710',
    company_tagline: 'Architecture & Consulting',
    company_location: 'Kyiv, Ukraine',
  });

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

        // Load site settings
        const settings = await siteSettingsService.getAll();
        setSiteSettings(settings);
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

  // Use dynamic sections if available, otherwise fall back to legacy components
  const useDynamicSections = project.sections && project.sections.length > 0;
  const sections = useDynamicSections ? project.sections! : generateLegacySections(project, language);

  return (
    <div className="bg-white text-zinc-900 antialiased">
      <Header />

      <main>
        {/* UNIVERSAL SECTION RENDERER - All sections dynamic including Hero! */}
        <SectionRenderer sections={sections} locale={language} />

        {/* Footer Section */}
        <FooterSection
          nextProject={nextProject || undefined}
          loadingNext={loadingNext}
          companyName={siteSettings.company_name}
          companyTagline={siteSettings.company_tagline}
          companyLocation={siteSettings.company_location}
        />
      </main>

      <Footer />
    </div>
  );
}

/**
 * Generate legacy sections from project data for backward compatibility
 * Used when project.sections is not set or empty
 */
function generateLegacySections(project: Project, locale: string): ProjectSection[] {
  const sections: ProjectSection[] = [];

  // Generate category if not provided
  const category = project.category || generateCategory(project.tags).full;

  // Generate design zones if not provided
  const designZones = project.design_zones && project.design_zones.length > 0
    ? project.design_zones
    : generateDesignZones(project);

  // Generate project images if not provided
  const projectImages = project.project_images && project.project_images.length > 0
    ? project.project_images
    : [{ url: project.image_url, alt: project.title, caption: '' }];

  // Generate features from design zones if available
  const features = designZones[0]?.features || [];

  // 1. Hero Section (order: 0)
  sections.push({
    id: 'section_hero',
    type: 'hero',
    order: 0,
    enabled: true,
    title: getSectionDefaultTitle('hero'),
    content: createDefaultSectionContent('hero'),
    translations: {
      [locale]: {
        title: project.title,
        subtitle: category,
        short_description: project.short_description || project.description[0],
        image_url: project.image_url
      } as any
    }
  });

  // 2. Metadata Section (order: 1)
  if (project.architects || project.area || project.location || project.year || project.photo_credits) {
    sections.push({
      id: 'section_metadata',
      type: 'metadata',
      order: 1,
      enabled: true,
      title: getSectionDefaultTitle('metadata'),
      content: createDefaultSectionContent('metadata'),
      translations: {
        [locale]: {
          architects: project.architects || 'Bureau 710',
          area: project.area || '',
          location: project.location || '',
          year: project.year || '',
          photo_credits: project.photo_credits || ''
        } as any
      }
    });
  }

  // 3. About Section (order: 2)
  if (project.subtitle || project.description?.length) {
    sections.push({
      id: 'section_about',
      type: 'about',
      order: 2,
      enabled: true,
      title: getSectionDefaultTitle('about'),
      content: createDefaultSectionContent('about'),
      translations: {
        [locale]: {
          icon: 'solar:sun-fog-linear',
          subtitle: category,
          title: project.subtitle || project.title,
          description: project.description || []
        } as any
      }
    });
  }

  // 4. Full-Width Image (order: 3)
  if (project.image_url) {
    sections.push({
      id: 'section_full_width_image',
      type: 'full-width-image',
      order: 3,
      enabled: true,
      title: getSectionDefaultTitle('full-width-image'),
      content: createDefaultSectionContent('image-block'),
      translations: {
        [locale]: {
          image_url: project.image_url,
          alt: project.title,
          height: '80vh',
          grayscale: false
        } as any
      }
    });
  }

  // 5. Concept Section (order: 4)
  if (project.concept_heading || project.concept_caption || project.concept_quote || project.description?.length > 0) {
    sections.push({
      id: 'section_concept',
      type: 'concept',
      order: 4,
      enabled: true,
      title: getSectionDefaultTitle('concept'),
      content: createDefaultSectionContent('concept'),
      translations: {
        [locale]: {
          heading: project.concept_heading || 'Культурний Код',
          caption: project.concept_caption || 'Concept & Context',
          description: project.description?.slice(0, 2) || [],
          quote: project.concept_quote || '',
          images: projectImages,
          features: features
        } as any
      }
    });
  }

  // 6. Design Zones (order: 5)
  if (designZones.length > 0) {
    sections.push({
      id: 'section_design_zones',
      type: 'design-zones',
      order: 5,
      enabled: true,
      title: getSectionDefaultTitle('design-zones'),
      content: createDefaultSectionContent('design-zones'),
      translations: {
        [locale]: {
          zones: designZones
        } as any
      }
    });
  }

  return sections;
}
