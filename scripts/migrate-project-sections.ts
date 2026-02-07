/**
 * Migration Script: Convert existing projects to use dynamic sections
 *
 * This script migrates existing projects to use the new sections array structure,
 * including converting legacy fields to dynamic sections (hero, metadata, about, etc.)
 *
 * Usage:
 *   npx tsx scripts/migrate-project-sections.ts
 *
 * Environment variables required:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type {
  ProjectSection,
  HeroSectionContent,
  MetadataSectionContent,
  AboutSectionContent,
  ConceptSectionContent,
  DesignZonesSectionContent,
} from '../src/types/sections';

import type {
  Project,
  DesignZone,
  ProjectImage,
} from '../src/types/project';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Migrate a single project to use sections array
 */
async function migrateProject(projectId: string): Promise<boolean> {
  try {
    console.log(`\n🔄 Migrating project: ${projectId}`);

    // Get existing project
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      console.error(`❌ Failed to fetch project ${projectId}:`, error);
      return false;
    }

    // Skip if already migrated
    if (project.sections && project.sections.length > 0) {
      console.log(`⏭️  Project ${projectId} already has sections, skipping...`);
      return true;
    }

    const sections: ProjectSection[] = [];

    // 1. HERO SECTION (order: 0) - Now dynamic!
    const heroContent: HeroSectionContent = {
      image_url: project.image_url,
      overlay_color: 'from-black/30 via-transparent to-black/60',
      parallax_enabled: true,
      title: project.title,
      subtitle: project.category || project.category_primary || project.subtitle || '',
      short_description: project.short_description || project.description?.[0] || '',
      layout: 'centered',
      animation_type: 'zoom'
    };

    sections.push({
      id: 'section_hero',
      type: 'hero',
      order: 0,
      enabled: true,
      title: 'Hero Section',
      content: heroContent
    });

    console.log('  ✅ Added hero section');

    // 2. METADATA SECTION (order: 1)
    if (project.architects || project.area || project.location || project.year || project.photo_credits) {
      const metadataContent: MetadataSectionContent = {
        architects: project.architects || 'Bureau 710',
        area: project.area || '',
        location: project.location || '',
        year: project.year || '',
        photo_credits: project.photo_credits || ''
      };

      sections.push({
        id: 'section_metadata',
        type: 'metadata',
        order: 1,
        enabled: true,
        title: 'Project Metadata',
        content: metadataContent
      });

      console.log('  ✅ Added metadata section');
    }

    // 3. ABOUT SECTION (order: 2)
    if (project.subtitle || project.description?.length) {
      const aboutContent: AboutSectionContent = {
        icon: 'solar:sun-fog-linear',
        subtitle: project.category || project.category_primary || '',
        title: project.title,
        description: project.description || []
      };

      sections.push({
        id: 'section_about',
        type: 'about',
        order: 2,
        enabled: true,
        title: 'About',
        content: aboutContent
      });

      console.log('  ✅ Added about section');
    }

    // 4. FULL-WIDTH IMAGE (order: 3)
    if (project.image_url) {
      sections.push({
        id: 'section_full_width_image',
        type: 'full-width-image',
        order: 3,
        enabled: true,
        title: 'Full Width Image',
        content: {
          image_url: project.image_url,
          caption: '',
          alt: project.title,
          height: '80vh',
          grayscale: false
        }
      });

      console.log('  ✅ Added full-width image section');
    }

    // 5. CONCEPT SECTION (order: 4)
    if (project.concept_heading || project.concept_caption || project.concept_quote) {
      const conceptContent: ConceptSectionContent = {
        heading: project.concept_heading || 'Культурний Код',
        caption: project.concept_caption || 'Concept & Context',
        description: project.description?.slice(0, 2) || [],
        quote: project.concept_quote || '',
        images: (project.project_images as ProjectImage[]) || [],
        features: []
      };

      sections.push({
        id: 'section_concept',
        type: 'concept',
        order: 4,
        enabled: true,
        title: 'Concept',
        content: conceptContent
      });

      console.log('  ✅ Added concept section');
    }

    // 6. DESIGN ZONES (order: 5)
    if (project.design_zones && project.design_zones.length > 0) {
      const designZonesContent: DesignZonesSectionContent = {
        zones: project.design_zones as DesignZone[]
      };

      sections.push({
        id: 'section_design_zones',
        type: 'design-zones',
        order: 5,
        enabled: true,
        title: 'Design Zones',
        content: designZonesContent
      });

      console.log('  ✅ Added design zones section');
    }

    // Update project with sections
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        sections,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error(`❌ Failed to update project ${projectId}:`, updateError);
      return false;
    }

    console.log(`✅ Successfully migrated project ${projectId} with ${sections.length} sections`);
    return true;
  } catch (error) {
    console.error(`❌ Error migrating project ${projectId}:`, error);
    return false;
  }
}

/**
 * Migrate all projects
 */
async function migrateAllProjects(): Promise<void> {
  try {
    console.log('🚀 Starting project sections migration...\n');

    // Get all projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, title');

    if (error) {
      console.error('❌ Failed to fetch projects:', error);
      process.exit(1);
    }

    if (!projects || projects.length === 0) {
      console.log('ℹ️  No projects found, exiting...');
      process.exit(0);
    }

    console.log(`📊 Found ${projects.length} projects to migrate\n`);

    // Migrate each project
    const results = await Promise.allSettled(
      projects.map(project => migrateProject(project.id))
    );

    // Count successes and failures
    const successes = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === false)).length;

    console.log('\n' + '='.repeat(60));
    console.log('📈 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total projects: ${projects.length}`);
    console.log(`✅ Successfully migrated: ${successes}`);
    console.log(`❌ Failed to migrate: ${failures}`);
    console.log('='.repeat(60) + '\n');

    if (failures > 0) {
      console.error('⚠️  Some projects failed to migrate. Check logs above for details.');
      process.exit(1);
    } else {
      console.log('✅ All projects migrated successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrateAllProjects();
