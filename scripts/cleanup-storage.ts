import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  console.error('Add them to your .env file:');
  console.error('  SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function listAllFiles(bucketName: string, prefix: string = ''): Promise<string[]> {
  const allFiles: string[] = [];
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(prefix, {
      limit: 1000,
    });

  if (error) {
    console.error(`Error listing ${prefix}:`, error);
    return allFiles;
  }

  if (!data) return allFiles;

  for (const item of data) {
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
    
    // If it's a folder (no metadata), recurse into it
    if (!item.metadata) {
      const subFiles = await listAllFiles(bucketName, itemPath);
      allFiles.push(...subFiles);
    } else {
      // It's a file, add to list
      allFiles.push(itemPath);
    }
  }

  return allFiles;
}

async function cleanupStorage() {
  console.log('🧹 Starting storage cleanup...\n');

  const bucketName = 'projects';

  try {
    console.log(`📂 Listing all files in bucket "${bucketName}"...`);
    
    const files = await listAllFiles(bucketName);

    if (files.length === 0) {
      console.log('✅ No files found in storage.');
      return;
    }

    console.log(`Found ${files.length} files to delete.\n`);

    // Delete files in batches of 100 (Supabase limit)
    const batchSize = 100;
    let deleted = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      console.log(`Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)} (${batch.length} files)...`);

      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(batch);

      if (deleteError) {
        console.error('Error deleting batch:', deleteError);
        failed += batch.length;
      } else {
        deleted += batch.length;
        console.log(`  ✅ Deleted ${batch.length} files`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Cleanup Summary:');
    console.log(`   Files deleted: ${deleted}`);
    console.log(`   Files failed:  ${failed}`);
    console.log('='.repeat(50));

    if (failed > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

cleanupStorage();
