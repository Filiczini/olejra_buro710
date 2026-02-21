import { supabase } from './config/supabase';

async function migrateProjects() {
  console.log('Starting project migration...');

  try {
    const { data: projects, error } = await supabase.from('projects').select('id, title');

    if (error) throw error;

    if (!projects || projects.length === 0) {
      console.log('No projects found to migrate');
      return;
    }

    console.log(`Found ${projects.length} projects to check`);

    let updatedCount = 0;

    for (const project of projects) {
      const { data: existing } = await supabase
        .from('projects')
        .select('architects, concept_heading, concept_caption')
        .eq('id', project.id)
        .single();

      if (!existing) continue;

      const updates: Record<string, any> = {};

      if (!existing.architects) {
        updates.architects = 'Bureau 710';
      }
      if (!existing.concept_heading) {
        updates.concept_heading = 'Культурний Код';
      }
      if (!existing.concept_caption) {
        updates.concept_caption = 'Концепція дизайну';
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', project.id);

        if (updateError) {
          console.error(`Error updating project "${project.title}":`, updateError.message);
        } else {
          console.log(`Updated project: ${project.title}`);
          updatedCount++;
        }
      } else {
        console.log(`Project already has all fields: ${project.title}`);
      }
    }

    console.log('');
    console.log('========================================');
    console.log('Migration Summary:');
    console.log(`   Total projects checked: ${projects.length}`);
    console.log(`   Projects updated: ${updatedCount}`);
    console.log('========================================');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateProjects();
