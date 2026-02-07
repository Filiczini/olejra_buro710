/**
 * Dynamic Product Page Section Types
 *
 * Supports fully CMS-driven product pages with dynamic content sections.
 * All sections (including Hero) are now dynamic and manageable via admin panel.
 */

/**
 * Available section types that can be added to a project page
 */
export type SectionType =
  | 'hero'               // Full-screen hero with parallax, zoom effects
  | 'metadata'           // Architectural specs (architects, area, location, year, photo_credits)
  | 'about'              // Text block with icon, subtitle, and description paragraphs
  | 'full-width-image'    // 80vh full-width image with grayscale hover effect
  | 'concept'            // Two-column layout (sticky left sidebar) with image gallery
  | 'design-zones'       // Multiple design zones with various layouts (split, centered, full-width)
  | 'text-block'         // Generic text block with title and paragraphs
  | 'image-block'        // Single image with optional caption
  | 'gallery'            // Image slider/carousel with multiple images
  | 'cta'                // Call-to-action section with button
  | 'tags';              // Tags/metadata display as pills or badges

/**
 * Hero section content (now fully editable!)
 */
export interface HeroSectionContent {
  // Visual
  image_url: string;                    // Background image URL
  overlay_color?: string;               // Gradient overlay CSS classes
  parallax_enabled?: boolean;           // Enable/disable parallax effect

  // Text content (ALL EDITABLE)
  title: string;                        // Main heading (e.g., "Markó")
  subtitle?: string;                    // Category label (e.g., "Hospitality / Heritage")
  short_description?: string;          // Preview text shown below title

  // Layout options
  layout?: 'centered' | 'left' | 'right' | 'split';

  // Animation options
  animation_type?: 'zoom' | 'fade' | 'slide' | 'none';

  // Optional CTA button
  cta_button?: {
    text: string;
    url: string;
    style?: 'primary' | 'secondary';
  };
}

/**
 * Metadata section content
 */
export interface MetadataSectionContent {
  architects: string;
  area: string;
  location: string;
  year: string;
  photo_credits: string;
}

/**
 * About section content
 */
export interface AboutSectionContent {
  icon?: string;                        // Icon name (e.g., 'solar:sun-fog-linear')
  subtitle?: string;                    // Small label text above title
  title: string;                        // Main heading
  description: string[];                // Array of paragraphs
}

/**
 * Concept section content
 */
export interface ConceptSectionContent {
  heading: string;                      // Main heading (e.g., "Культурний Код")
  caption: string;                      // Label (e.g., "Concept & Context")
  description: string[];                // Paragraphs
  quote?: string;                       // Optional quote text
  images: ProjectImage[];               // Image gallery
  features?: string[];                  // Optional feature list with dots
}

/**
 * Design zones section content
 */
export interface DesignZonesSectionContent {
  zones: DesignZone[];
}

/**
 * Generic text block content
 */
export interface TextBlockContent {
  title?: string;                        // Optional heading
  content: string[];                    // Array of paragraphs
}

/**
 * Image block content
 */
export interface ImageBlockContent {
  image_url: string;                    // Image URL
  caption?: string;                     // Optional caption text
  alt?: string;                         // Alt text for accessibility
  height?: string;                       // CSS height (e.g., '80vh', '70vh')
  grayscale?: boolean;                   // Grayscale to color on hover effect
}

/**
 * Gallery section content
 */
export interface GalleryContent {
  images: ProjectImage[];               // Array of images
  layout?: 'grid' | 'slider';           // Grid or carousel layout
  autoplay?: boolean;                    // Auto-advance slides
}

/**
 * CTA section content
 */
export interface CTAContent {
  title: string;                        // Main heading
  description?: string;                 // Optional subtext
  button_text: string;                  // Button label
  button_url: string;                   // Button destination URL
}

/**
 * Tags section content
 */
export interface TagsContent {
  title?: string;                        // Optional heading
  tags: string[];                       // Array of tags to display
}

/**
 * Section translation (for i18n support)
 */
export interface SectionTranslation {
  title?: string;                        // Translated section title
  content?: any;                         // Translated content (type-specific)
}

/**
 * Dynamic project section
 */
export interface ProjectSection {
  id: string;                            // Unique section identifier
  type: SectionType;                      // Section type
  order: number;                          // Display order (0 = first, hero section)
  enabled: boolean;                       // Visibility toggle
  title?: string;                         // Section heading (for admin display)
  content: any;                           // Type-specific content (see interfaces above)
  translations?: Record<string, SectionTranslation>; // Keyed by locale (e.g., 'uk', 'en', 'de')
}

/**
 * Union type for all section content types
 */
export type SectionContent =
  | HeroSectionContent
  | MetadataSectionContent
  | AboutSectionContent
  | ConceptSectionContent
  | DesignZonesSectionContent
  | TextBlockContent
  | ImageBlockContent
  | GalleryContent
  | CTAContent
  | TagsContent;

/**
 * Design zone (existing, reused)
 */
export interface DesignZone {
  id: string;
  name: string;
  order: number;
  title: string;
  description: string;
  image_url?: string;
  layout?: 'full-width' | 'split' | 'centered' | 'split-reverse';
  features?: string[];
  alt?: string;
}

/**
 * Project image (existing, reused)
 */
export interface ProjectImage {
  url: string;
  caption?: string;
  alt?: string;
}

/**
 * Material (existing, reused)
 */
export interface Material {
  name: string;
  color?: string;
  type?: 'surface' | 'accent' | 'natural';
}

/**
 * Updated Project interface with dynamic sections
 */
export interface Project {
  id: string;
  title: string;
  description: string[];
  image_url: string;                      // Fallback/legacy image
  tags: string[];

  // DYNAMIC SECTIONS (ALL sections including Hero are here!)
  sections?: ProjectSection[];            // All page sections in order

  // Legacy fields (for backward compatibility, will be migrated to sections)
  location?: string;
  area?: string;
  year?: string;
  team?: string;
  architects?: string;
  concept_heading?: string;
  concept_caption?: string;
  concept_quote?: string;
  category?: string;
  category_primary?: string;
  category_secondary?: string;
  short_description?: string;
  subtitle?: string;
  photo_credits?: string;
  project_images?: ProjectImage[];
  design_zones?: DesignZone[];
  materials?: Material[];

  created_at: string;
  updated_at: string;
}

/**
 * Translation record for entire project
 */
export interface ProjectTranslation {
  locale: string;                         // e.g., 'uk', 'en', 'de'
  title: string;                           // Translated project title
  sections: Record<string, SectionTranslation>; // sectionId → translation
}

/**
 * Default content generators (used when creating new sections)
 */
export const createDefaultSectionContent = (
  type: SectionType
): SectionContent => {
  switch (type) {
    case 'hero':
      return {
        image_url: '',
        overlay_color: 'from-black/30 via-transparent to-black/60',
        parallax_enabled: true,
        title: '',
        subtitle: '',
        short_description: '',
        layout: 'centered',
        animation_type: 'zoom'
      } as HeroSectionContent;

    case 'metadata':
      return {
        architects: 'Bureau 710',
        area: '',
        location: '',
        year: '',
        photo_credits: ''
      } as MetadataSectionContent;

    case 'about':
      return {
        icon: 'solar:sun-fog-linear',
        subtitle: '',
        title: '',
        description: ['']
      } as AboutSectionContent;

    case 'concept':
      return {
        heading: 'Культурний Код',
        caption: 'Concept & Context',
        description: [''],
        images: [],
        features: []
      } as ConceptSectionContent;

    case 'design-zones':
      return {
        zones: []
      } as DesignZonesSectionContent;

    case 'text-block':
      return {
        title: '',
        content: ['']
      } as TextBlockContent;

    case 'image-block':
      return {
        image_url: '',
        caption: '',
        alt: '',
        height: '80vh',
        grayscale: false
      } as ImageBlockContent;

    case 'gallery':
      return {
        images: [],
        layout: 'grid',
        autoplay: false
      } as GalleryContent;

    case 'cta':
      return {
        title: '',
        description: '',
        button_text: 'Learn More',
        button_url: ''
      } as CTAContent;

    case 'tags':
      return {
        title: 'Tags',
        tags: []
      } as TagsContent;

    default:
      throw new Error(`Unknown section type: ${type}`);
  }
};

/**
 * Default section titles for admin display
 */
export const getSectionDefaultTitle = (type: SectionType): string => {
  const titles: Record<SectionType, string> = {
    hero: 'Hero Section',
    metadata: 'Project Metadata',
    about: 'About Section',
    'full-width-image': 'Full Width Image',
    concept: 'Concept Section',
    'design-zones': 'Design Zones',
    'text-block': 'Text Block',
    'image-block': 'Image Block',
    gallery: 'Gallery',
    cta: 'Call to Action',
    tags: 'Tags'
  };

  return titles[type];
};
