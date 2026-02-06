import { supabase } from './config/supabase';

async function clearProjects() {
  console.log('🗑️  Clearing all projects from Supabase...');

  try {
    const { error, count } = await supabase
      .from('projects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('❌ Error clearing projects:', error);
      console.error(`   Code: ${error.code}`);
      console.error(`   Message: ${error.message}`);
      process.exit(1);
    }

    console.log(`✅ Cleared ${count} projects successfully`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

clearProjects();
