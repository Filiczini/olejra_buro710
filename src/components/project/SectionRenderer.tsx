/**
 * Universal Section Renderer
 *
 * Dynamically renders project sections based on their type.
 * Maps section.type → React component with content injection.
 */

import { ProjectSection, SectionType } from '@/types';
import { HeroSection } from './sections/HeroSection';
import { MetadataSection } from './sections/MetadataSection';
import { AboutSection } from './sections/AboutSection';
import { FullWidthImageSection } from './sections/FullWidthImageSection';
import { ConceptSection } from './sections/ConceptSection';
import { DesignZonesSection } from './sections/DesignZonesSection';
import { TextBlockSection } from './sections/TextBlockSection';
import { ImageBlockSection } from './sections/ImageBlockSection';
import { GallerySection } from './sections/GallerySection';
import { CTASection } from './sections/CTASection';
import { TagsSection } from './sections/TagsSection';

// Section type → component mapping
const SECTION_COMPONENTS = {
  hero: HeroSection,
  metadata: MetadataSection,
  about: AboutSection,
  'full-width-image': FullWidthImageSection,
  concept: ConceptSection,
  'design-zones': DesignZonesSection,
  'text-block': TextBlockSection,
  'image-block': ImageBlockSection,
  gallery: GallerySection,
  cta: CTASection,
  tags: TagsSection,
} as const;

interface SectionRendererProps {
  sections: ProjectSection[];
  locale?: string; // Current locale (default: 'uk')
}

/**
 * Universal Section Renderer
 *
 * Filters enabled sections, sorts by order, and renders dynamically.
 * Applies translations if available.
 */
export const SectionRenderer: React.FC<SectionRendererProps> = ({
  sections,
  locale = 'uk'
}) => {
  // Filter enabled sections and sort by order
  const enabledSections = sections
    .filter(section => section.enabled !== false)
    .sort((a, b) => a.order - b.order);

  if (enabledSections.length === 0) {
    return null;
  }

  return (
    <>
      {enabledSections.map((section) => {
        const SectionComponent = SECTION_COMPONENTS[section.type];

        if (!SectionComponent) {
          console.warn(`[SectionRenderer] Unknown section type: ${section.type}`);
          return null;
        }

        // Get translation if available
        const translation = section.translations?.[locale];

        return (
          <SectionComponent
            key={section.id}
            content={section.content}
            translations={translation}
          />
        );
      })}
    </>
  );
};
