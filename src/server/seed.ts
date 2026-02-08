import { supabase } from './config/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../projects-seed-data.json'), 'utf-8'));

async function seed() {
  console.log('Seeding project data to Supabase...');
  console.log(`Total projects to insert: ${seedData.length}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < seedData.length; i++) {
    const project = seedData[i];
    console.log(`[${i + 1}/${seedData.length}] Inserting: ${project.title}...`);
    
    try {
      const { error } = await supabase.from('projects').insert(project);
      
      if (error) {
        errorCount++;
        console.error(`Error inserting "${project.title}":`);
        console.error(`   Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);
        console.error('');
      } else {
        successCount++;
        console.log(`Inserted: ${project.title}`);
        console.log(`   Location: ${project.location}`);
        console.log(`   Area: ${project.area}`);
        console.log(`   Year: ${project.year}`);
        console.log(`   Tags: ${project.tags.join(', ')}`);
        console.log('');
      }
    } catch (error) {
      errorCount++;
      console.error(`Unexpected error inserting "${project.title}":`, error);
      console.error('');
    }
  }
  
  console.log('========================================');
  console.log('Summary:');
  console.log(`   Successfully inserted: ${successCount}`);
  console.log(`   Failed to insert: ${errorCount}`);
  console.log(`   Total: ${seedData.length}`);
  console.log('========================================');
  
  if (errorCount === 0) {
    console.log('Seeding completed successfully!');
    process.exit(0);
  } else if (successCount > 0) {
    console.log('Seeding completed with some errors');
    process.exit(1);
  } else {
    console.log('Seeding failed completely');
    process.exit(1);
  }
}

seed();
