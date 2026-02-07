# Dynamic Product Page Implementation Plan

**Task Reference**: Адаптація сторінки продукту (мінімальні зміни — максимальний результат)

**Goal**: Transform product page from hardcoded content to CMS-driven while preserving the Hero section exactly as is.

---

## 📋 Executive Summary

### What Will NOT Change
- ✅ Hero section (HeroSection.tsx) - frozen, no modifications
- ✅ First fold UX structure
- ✅ Main styles and design system

### What Will Change
- 🔄 All sections after Hero become dynamic (managed via admin)
- 🔄 Universal section renderer replaces hardcoded components
- 🔄 Admin panel gains section management capabilities
- 🔄 Translation support for all labels

---

## 🏗️ Architecture Overview

### New Data Model

```typescript
// Section types that can be added dynamically
type SectionType =
  | 'metadata'           // Architectural specs (architects, area, location, year, photo_credits)
  | 'about'              // Text block with icon (title + description)
  | 'full-width-image'    // 80vh full-width image with hover effect
  | 'concept'            // Two-column layout with image gallery
  | 'design-zones'       // Multiple design zones with layouts
  | 'text-block'         // Generic text block
  | 'image-block'        // Image + caption
  | 'gallery'            // Image slider/carousel
  | 'cta'                // Call-to-action section
  | 'tags'               // Tags/metadata display

// Dynamic section structure
interface ProjectSection {
  id: string;
  type: SectionType;              // Section type
  order: number;                 // Display order
  enabled: boolean;              // Visibility toggle
  title?: string;                // Section heading
  content?: any;                 // Type-specific content
  translations?: Record<string, SectionTranslation>;
}

interface SectionTranslation {
  title?: string;
  content?: any;                 // Localized content
}

// Updated Project interface
interface Project {
  id: string;
  title: string;
  description: string[];
  image_url: string;
  tags: string[];

  // HERO SECTION (READ-ONLY - FROZEN)
  hero_image_url: string;        // Hero background image
  hero_subtitle?: string;        // Hero category/label
  hero_short_description?: string; // Hero preview text

  // DYNAMIC SECTIONS (CMS-DRIVEN)
  sections?: ProjectSection[];   // All sections after hero

  // Legacy fields (deprecated, for backward compatibility)
  location?: string;
  area?: string;
  year?: string;
  team?: string;
  architects?: string;
  concept_heading?: string;
  concept_caption?: string;
  concept_quote?: string;
  category?: string;
  short_description?: string;
  subtitle?: string;
  photo_credits?: string;
  project_images?: ProjectImage[];
  design_zones?: DesignZone[];
  materials?: Material[];

  created_at: string;
  updated_at: string;
}
```

### Content Structure per Section Type

```typescript
// Metadata section content
interface MetadataSection {
  architects: string;
  area: string;
  location: string;
  year: string;
  photo_credits: string;
}

// About section content
interface AboutSection {
  icon?: string;                 // Icon name (e.g., 'solar:sun-fog-linear')
  subtitle?: string;             // Small label text
  title: string;                 // Main heading
  description: string[];         // Paragraphs
}

// Concept section content
interface ConceptSection {
  heading: string;               // Main heading (e.g., "Культурний Код")
  caption: string;               // Label (e.g., "Concept & Context")
  description: string[];         // Paragraphs
  quote?: string;                // Optional quote text
  images: ProjectImage[];        // Image gallery
  features?: string[];           // Optional feature list with dots
}

// Design zone content
interface DesignZoneSection {
  zones: DesignZone[];           // Array of design zones
}

// Generic text block
interface TextBlockContent {
  title?: string;
  content: string[];
}

// Image block
interface ImageBlockContent {
  image_url: string;
  caption?: string;
  alt?: string;
  height?: string;               // e.g., '80vh', '70vh'
  grayscale?: boolean;            // Default false
}

// Gallery content
interface GalleryContent {
  images: ProjectImage[];
  layout?: 'grid' | 'slider';    // Default: grid
  autoplay?: boolean;             // Default: false
}

// CTA content
interface CTAContent {
  title: string;
  description?: string;
  button_text: string;
  button_url: string;
}
```

---

## 📊 Database Schema Changes

### New Migration: `003-add-project-sections.sql`

```sql
-- Add hero section fields (read-only)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS hero_short_description TEXT;

-- Add dynamic sections array
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]';

-- Create index for sections array (for querying specific section types)
CREATE INDEX IF NOT EXISTS idx_projects_sections
  ON projects USING GIN (sections);

-- Update existing projects with default sections
-- This will be handled by migration script
```

### Backward Compatibility

The migration script will:
1. Create `hero_image_url` from existing `image_url`
2. Migrate existing fields to `sections` array with default structure
3. Keep legacy fields intact for existing projects

---

## 🎨 Frontend Components

### Universal Section Renderer

**New File**: `src/components/project/SectionRenderer.tsx`

```typescript
import { ProjectSection } from '@/types/project';
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
  locale?: string;               // Current locale (default: 'uk')
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  sections,
  locale = 'uk'
}) => {
  // Filter enabled sections and sort by order
  const enabledSections = sections
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <main className="bg-white">
      {enabledSections.map((section) => {
        const SectionComponent = SECTION_COMPONENTS[section.type];

        if (!SectionComponent) {
          console.warn(`Unknown section type: ${section.type}`);
          return null;
        }

        return (
          <SectionComponent
            key={section.id}
            title={section.title}
            content={section.content}
            translations={section.translations?.[locale]}
          />
        );
      })}
    </main>
  );
};
```

### Refactored Project Page

**Modified File**: `src/pages/ProjectPage.tsx`

```typescript
import { HeroSection } from '@/components/project/HeroSection';
import { SectionRenderer } from '@/components/project/SectionRenderer';
import { FooterSection } from '@/components/project/FooterSection';

export const ProjectPage: React.FC = () => {
  const { id } = useParams();
  const { project, loading, error } = useProject(id);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;
  if (!project) return <NotFound />;

  return (
    <article className="project-page">
      {/* HERO SECTION - READ-ONLY, NO CHANGES */}
      <HeroSection
        image={project.hero_image_url}
        title={project.title}
        subtitle={project.hero_subtitle}
        shortDescription={project.hero_short_description}
      />

      {/* DYNAMIC SECTIONS - CMS-DRIVEN */}
      <SectionRenderer
        sections={project.sections || []}
        locale="uk"
      />

      {/* FOOTER - UNCHANGED */}
      <FooterSection />
    </article>
  );
};
```

### Individual Section Components

All existing section components will be refactored to accept:

```typescript
interface BaseSectionProps {
  title?: string;
  content: any;                 // Type-specific content
  translations?: SectionTranslation;
}

// Example: Refactored MetadataSection
export const MetadataSection: React.FC<BaseSectionProps> = ({
  content,
  translations
}) => {
  const {
    architects,
    area,
    location,
    year,
    photo_credits
  } = translations?.content || content;

  return (
    <section className="border-b border-zinc-100 bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
          {/* Render metadata fields */}
        </div>
      </div>
    </section>
  );
};
```

---

## 🔧 Admin Panel Changes

### New Admin Page: Section Manager

**New File**: `src/pages/admin/ProjectSectionsPage.tsx`

```typescript
import { useState } from 'react';
import { useProject } from '@/hooks/useProject';

interface SectionManagerProps {
  projectId: string;
}

export const ProjectSectionsPage: React.FC<SectionManagerProps> = ({
  projectId
}) => {
  const { project, updateProject } = useProject(projectId);
  const [sections, setSections] = useState(project.sections || []);

  // Drag-and-drop reordering
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);

    // Update order numbers
    const reordered = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setSections(reordered);
  };

  // Toggle visibility
  const handleToggle = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  // Add new section
  const handleAddSection = (type: SectionType) => {
    const newSection: ProjectSection = {
      id: `section_${Date.now()}`,
      type,
      order: sections.length,
      enabled: true,
      title: getDefaultTitle(type),
      content: getDefaultContent(type)
    };

    setSections([...sections, newSection]);
  };

  // Edit section content
  const handleEditSection = (sectionId: string, updates: Partial<ProjectSection>) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, ...updates }
        : section
    ));
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    setSections(sections.filter(s => s.id !== sectionId));
  };

  // Save all changes
  const handleSave = async () => {
    await updateProject(projectId, { sections });
    alert('Sections saved successfully!');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Manage Sections</h1>
        <p className="text-zinc-500">
          Reorder, enable/disable, and edit content sections
        </p>
      </div>

      {/* Add new section button */}
      <AddSectionDropdown onAdd={handleAddSection} />

      {/* Sections list with drag-and-drop */}
      <div className="space-y-4 mt-8">
        {sections.map((section, index) => (
          <SectionEditor
            key={section.id}
            section={section}
            index={index}
            onReorder={handleReorder}
            onToggle={handleToggle}
            onEdit={handleEditSection}
            onDelete={handleDeleteSection}
          />
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="mt-8 px-6 py-3 bg-zinc-900 text-white"
      >
        Save Changes
      </button>
    </div>
  );
};
```

### Section Editor Component

**New File**: `src/components/admin/SectionEditor.tsx`

```typescript
import { useState } from 'react';
import { ProjectSection, SectionType } from '@/types/project';

interface SectionEditorProps {
  section: ProjectSection;
  index: number;
  onReorder: (from: number, to: number) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<ProjectSection>) => void;
  onDelete: (id: string) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  index,
  onReorder,
  onToggle,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(section.content);

  return (
    <div className={`border ${section.enabled ? 'border-zinc-200' : 'border-zinc-100 opacity-50'} rounded-lg p-4`}>
      {/* Header with drag handle and actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Drag handle */}
          <button
            className="cursor-grab text-zinc-400 hover:text-zinc-600"
            title="Drag to reorder"
          >
            ☰
          </button>

          {/* Section type badge */}
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            {section.type}
          </span>

          {/* Section title */}
          <span className="font-medium">
            {section.title || 'Untitled Section'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle visibility */}
          <button
            onClick={() => onToggle(section.id)}
            className={`px-3 py-1 text-xs ${
              section.enabled ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {section.enabled ? 'Visible' : 'Hidden'}
          </button>

          {/* Edit */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 text-xs bg-zinc-100 text-zinc-600"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(section.id)}
            className="px-3 py-1 text-xs bg-red-100 text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content editor */}
      {isEditing && (
        <SectionContentEditor
          type={section.type}
          content={editedContent}
          onChange={(newContent) => {
            setEditedContent(newContent);
            onEdit(section.id, { content: newContent });
          }}
        />
      )}
    </div>
  );
};
```

### Content Type Editors

**New File**: `src/components/admin/SectionContentEditor.tsx`

```typescript
import { ProjectSection } from '@/types/project';

interface SectionContentEditorProps {
  type: ProjectSection['type'];
  content: any;
  onChange: (content: any) => void;
}

export const SectionContentEditor: React.FC<SectionContentEditorProps> = ({
  type,
  content,
  onChange
}) => {
  switch (type) {
    case 'metadata':
      return <MetadataEditor content={content} onChange={onChange} />;

    case 'about':
      return <AboutEditor content={content} onChange={onChange} />;

    case 'concept':
      return <ConceptEditor content={content} onChange={onChange} />;

    case 'design-zones':
      return <DesignZonesEditor content={content} onChange={onChange} />;

    case 'text-block':
      return <TextBlockEditor content={content} onChange={onChange} />;

    case 'image-block':
      return <ImageBlockEditor content={content} onChange={onChange} />;

    case 'gallery':
      return <GalleryEditor content={content} onChange={onChange} />;

    case 'cta':
      return <CTAEditor content={content} onChange={onChange} />;

    case 'tags':
      return <TagsEditor content={content} onChange={onChange} />;

    default:
      return <div className="text-red-500">Unknown section type: {type}</div>;
  }
};
```

### Example Editor: About Section

```typescript
interface AboutEditorProps {
  content: AboutSection;
  onChange: (content: AboutSection) => void;
}

export const AboutEditor: React.FC<AboutEditorProps> = ({
  content,
  onChange
}) => {
  return (
    <div className="space-y-4">
      {/* Icon input */}
      <div>
        <label className="block text-sm font-medium mb-2">Icon</label>
        <input
          type="text"
          value={content.icon || ''}
          onChange={(e) => onChange({ ...content, icon: e.target.value })}
          placeholder="e.g., solar:sun-fog-linear"
          className="w-full px-3 py-2 border"
        />
      </div>

      {/* Subtitle input */}
      <div>
        <label className="block text-sm font-medium mb-2">Subtitle</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border"
        />
      </div>

      {/* Title input */}
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={content.title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border"
        />
      </div>

      {/* Description paragraphs */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        {content.description.map((paragraph, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <textarea
              value={paragraph}
              onChange={(e) => {
                const newDescription = [...content.description];
                newDescription[index] = e.target.value;
                onChange({ ...content, description: newDescription });
              }}
              className="flex-1 px-3 py-2 border"
              rows={3}
            />
            <button
              onClick={() => {
                const newDescription = content.description.filter((_, i) => i !== index);
                onChange({ ...content, description: newDescription });
              }}
              className="px-3 py-2 text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange({ ...content, description: [...content.description, ''] })}
          className="mt-2 px-3 py-2 bg-zinc-100"
        >
          Add Paragraph
        </button>
      </div>
    </div>
  );
};
```

---

## 🌍 Translation Support

### Translation Data Structure

```typescript
interface SectionTranslation {
  title?: string;
  content?: any;
}

interface ProjectTranslation {
  title: string;
  hero_subtitle?: string;
  hero_short_description?: string;
  sections: Record<string, SectionTranslation>;  // sectionId → translation
}
```

### Translation Editor

**New File**: `src/components/admin/TranslationEditor.tsx`

```typescript
import { useState } from 'react';
import { ProjectSection } from '@/types/project';

interface TranslationEditorProps {
  sections: ProjectSection[];
  onSave: (translations: Record<string, Record<string, SectionTranslation>>) => void;
}

export const TranslationEditor: React.FC<TranslationEditorProps> = ({
  sections,
  onSave
}) => {
  const [locale, setLocale] = useState('en');
  const [translations, setTranslations] = useState<Record<string, SectionTranslation>>({});

  const handleSave = () => {
    onSave({
      [locale]: translations
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Translations</h1>

        {/* Locale selector */}
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="mt-4 px-3 py-2 border"
        >
          <option value="uk">Ukrainian (default)</option>
          <option value="en">English</option>
          <option value="de">German</option>
        </select>
      </div>

      {/* Section translations */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="border p-4">
            <h3 className="font-medium mb-4">{section.title}</h3>

            {/* Title translation */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Title Translation ({locale})
              </label>
              <input
                type="text"
                value={translations[section.id]?.title || ''}
                onChange={(e) => {
                  setTranslations({
                    ...translations,
                    [section.id]: {
                      ...translations[section.id],
                      title: e.target.value
                    }
                  });
                }}
                className="w-full px-3 py-2 border"
                placeholder="Leave empty to use default"
              />
            </div>

            {/* Content translation based on type */}
            <SectionTranslationContentEditor
              type={section.type}
              content={section.content}
              translation={translations[section.id]?.content}
              onChange={(content) => {
                setTranslations({
                  ...translations,
                  [section.id]: {
                    ...translations[section.id],
                    content
                  }
                });
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-8 px-6 py-3 bg-zinc-900 text-white"
      >
        Save Translations
      </button>
    </div>
  );
};
```

---

## 🔄 API Updates

### New Endpoints

**File**: `src/server/routes/portfolio.ts`

```typescript
// GET sections for a project
router.get('/portfolio/:projectId/sections', async (req, res) => {
  const { projectId } = req.params;

  const { data, error } = await supabase
    .from('projects')
    .select('sections')
    .eq('id', projectId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ sections: data.sections || [] });
});

// PUT update sections (admin only)
router.put('/portfolio/:projectId/sections', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const { sections } = req.body;

  const { data, error } = await supabase
    .from('projects')
    .update({ sections, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ project: data });
});

// PUT update section translations (admin only)
router.put('/portfolio/:projectId/translations', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const { translations } = req.body;

  // Merge translations with existing
  const { data: existing } = await supabase
    .from('projects')
    .select('translations')
    .eq('id', projectId)
    .single();

  const updatedTranslations = {
    ...(existing.translations || {}),
    ...translations
  };

  const { data, error } = await supabase
    .from('projects')
    .update({ translations: updatedTranslations })
    .eq('id', projectId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ project: data });
});
```

---

## 📦 Migration Script

**New File**: `scripts/migrate-project-sections.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateProject(projectId: string) {
  // Get existing project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) {
    console.error(`Project ${projectId} not found`);
    return;
  }

  // Build sections array from existing fields
  const sections: ProjectSection[] = [];

  // 1. Metadata section (order: 0)
  if (project.architects || project.area || project.location || project.year || project.photo_credits) {
    sections.push({
      id: 'section_metadata',
      type: 'metadata',
      order: 0,
      enabled: true,
      title: 'Project Metadata',
      content: {
        architects: project.architects || 'Bureau 710',
        area: project.area || '',
        location: project.location || '',
        year: project.year || '',
        photo_credits: project.photo_credits || ''
      }
    });
  }

  // 2. About section (order: 1)
  if (project.subtitle || project.description?.length) {
    sections.push({
      id: 'section_about',
      type: 'about',
      order: 1,
      enabled: true,
      title: 'About',
      content: {
        icon: 'solar:sun-fog-linear',
        subtitle: project.category || '',
        title: project.title,
        description: project.description || []
      }
    });
  }

  // 3. Full-width image (order: 2)
  if (project.image_url) {
    sections.push({
      id: 'section_full_width_image',
      type: 'full-width-image',
      order: 2,
      enabled: true,
      content: {
        image_url: project.image_url,
        caption: '',
        alt: project.title,
        height: '80vh',
        grayscale: false
      }
    });
  }

  // 4. Concept section (order: 3)
  if (project.concept_heading || project.concept_caption) {
    sections.push({
      id: 'section_concept',
      type: 'concept',
      order: 3,
      enabled: true,
      title: 'Concept',
      content: {
        heading: project.concept_heading || 'Культурний Код',
        caption: project.concept_caption || 'Concept & Context',
        description: project.description?.slice(0, 2) || [],
        quote: project.concept_quote,
        images: project.project_images || [],
        features: []
      }
    });
  }

  // 5. Design zones (order: 4)
  if (project.design_zones?.length) {
    sections.push({
      id: 'section_design_zones',
      type: 'design-zones',
      order: 4,
      enabled: true,
      title: 'Design Zones',
      content: {
        zones: project.design_zones
      }
    });
  }

  // Update project with sections
  const { error } = await supabase
    .from('projects')
    .update({
      sections,
      hero_image_url: project.image_url,
      hero_subtitle: project.category,
      hero_short_description: project.short_description,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId);

  if (error) {
    console.error(`Failed to migrate project ${projectId}:`, error);
  } else {
    console.log(`✅ Migrated project ${projectId} successfully`);
  }
}

// Migrate all projects
async function migrateAllProjects() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id');

  if (error) {
    console.error('Failed to fetch projects:', error);
    return;
  }

  console.log(`Migrating ${projects.length} projects...`);

  for (const project of projects) {
    await migrateProject(project.id);
  }

  console.log('✅ Migration complete!');
}

migrateAllProjects();
```

---

## ✅ Success Criteria Checklist

### Must Have (Blocking)
- [ ] Hero section remains completely unchanged (no visual or code changes)
- [ ] All sections after Hero are dynamic (sections array in database)
- [ ] Universal SectionRenderer component implemented
- [ ] Admin panel can add/edit/delete/reorder sections
- [ ] Admin panel can toggle section visibility
- [ ] No hardcoded text after Hero section
- [ ] Database migration created and tested
- [ ] Migration script successfully converts existing projects
- [ ] API endpoints for sections CRUD work correctly

### Should Have (Important)
- [ ] Translation support for all section labels
- [ ] Drag-and-drop reordering in admin panel
- [ ] Multiple section types available (metadata, about, concept, etc.)
- [ ] Image upload for section images
- [ ] Backward compatibility with existing projects

### Nice to Have (Enhancement)
- [ ] Preview mode in admin panel
- [ ] Section templates
- [ ] Bulk operations (enable/disable all)
- [ ] Section copy/paste between projects
- [ ] Version history for sections

---

## 🚀 Implementation Phases

### Phase 1: Foundation (1-2 days)
1. Extend TypeScript types with ProjectSection and content types
2. Create database migration `003-add-project-sections.sql`
3. Update API endpoints for sections
4. Test migration on development database

### Phase 2: Frontend Refactoring (2-3 days)
1. Create universal SectionRenderer component
2. Refactor existing section components to accept content prop
3. Update ProjectPage to use SectionRenderer
4. Test rendering with hardcoded sections

### Phase 3: Admin Panel (3-4 days)
1. Create SectionEditor component
2. Implement content type editors for each section type
3. Add drag-and-drop reordering
4. Add visibility toggles
5. Integrate with Create/Edit project pages

### Phase 4: Translations (1-2 days)
1. Add translation data structure
2. Create TranslationEditor component
3. Update SectionRenderer to support translations
4. Test with multiple locales

### Phase 5: Migration & Testing (1-2 days)
1. Create migration script
2. Run migration script on all existing projects
3. Test all sections render correctly
4. Test admin panel operations
5. Test translation system
6. Deploy to staging

---

## 📝 Notes

### Hero Section Preservation
The Hero section (`HeroSection.tsx`) is **FROZEN**. No modifications allowed to:
- Component structure
- Props interface
- Styling
- Animation behavior

All hero data will be stored in separate fields:
- `hero_image_url`
- `hero_subtitle`
- `hero_short_description`

These fields are read-only and populated during migration.

### Backward Compatibility
Existing projects will continue to work using legacy fields. The migration script:
1. Copies legacy data to sections array
2. Does not remove legacy fields
3. Allows gradual migration to new structure

### Performance Considerations
- Sections array is JSONB with GIN index for fast queries
- Lazy loading for images in galleries
- Optimize database queries with select projections

### Security
- Section management requires admin authentication
- Image uploads validated for size and format
- SQL injection protection via Supabase client

---

**Document Version**: 1.0
**Last Updated**: 2026-02-07
**Status**: Ready for Implementation
