import { supabase } from './config/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed-data.json'), 'utf-8'));
async function seed() {
    console.log('Seeding data...');
    for (const project of seedData) {
        const { error } = await supabase.from('projects').insert(project);
        if (error) {
            console.error('Error inserting:', error);
        }
        else {
            console.log('Inserted:', project.title);
        }
    }
    console.log('Seeding complete!');
    process.exit(0);
}
seed();
