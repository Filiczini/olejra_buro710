// @ts-nocheck
/**
 * One-time migration script: Supabase → PostgreSQL + local storage
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DATABASE_URL=... UPLOADS_DIR=... tsx src/migrate-from-supabase.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { db, pool } from './db';
import { posts, blocks, users, activityLogs, contactMessages } from './db/schema';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/app/uploads';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function downloadImage(url: string, localPath: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const dir = path.dirname(localPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(localPath, buffer);
  return localPath;
}

function supabaseUrlToLocal(url: string): { localPath: string; publicUrl: string } | null {
  if (!url || !url.includes(SUPABASE_URL!)) return null;

  // Extract path after /storage/v1/object/public/
  const match = url.match(/\/storage\/v1\/object\/public\/(.+)/);
  if (!match) return null;

  const storagePath = match[1]; // e.g. "projects/media/file.jpg" or "blocks/blocks/file.jpg"
  const folder = storagePath.startsWith('blocks/') ? 'blocks' : 'posts';
  const fileName = path.basename(storagePath);
  const localPath = path.join(UPLOADS_DIR, folder, fileName);
  const publicUrl = `/uploads/${folder}/${fileName}`;

  return { localPath, publicUrl };
}

async function migrateTable(tableName: string, insertFn: (rows: any[]) => Promise<void>) {
  console.log(`\nMigrating ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`  Error fetching ${tableName}:`, error.message);
    return [];
  }
  if (!data || data.length === 0) {
    console.log(`  No rows in ${tableName}`);
    return [];
  }
  console.log(`  Found ${data.length} rows`);
  await insertFn(data);
  console.log(`  Inserted ${data.length} rows`);
  return data;
}

async function migrateImages(allPosts: any[], allBlocks: any[]) {
  console.log('\nMigrating images...');
  const urlMap = new Map<string, string>(); // old URL -> new /uploads/... URL
  const imageUrls: string[] = [];

  // Collect all image URLs from posts
  for (const post of allPosts) {
    if (post.hero_image_url) imageUrls.push(post.hero_image_url);
    if (post.og_image_url) imageUrls.push(post.og_image_url);
    if (post.gallery_images) {
      for (const url of post.gallery_images) {
        if (url) imageUrls.push(url);
      }
    }
  }

  // Collect image URLs from blocks
  for (const block of allBlocks) {
    if (block.data?.image_url) imageUrls.push(block.data.image_url);
    if (block.data?.images) {
      for (const img of block.data.images) {
        if (img?.url) imageUrls.push(img.url);
      }
    }
  }

  const uniqueUrls = [...new Set(imageUrls)];
  console.log(`  Found ${uniqueUrls.length} unique image URLs`);

  let downloaded = 0;
  let skipped = 0;

  for (const url of uniqueUrls) {
    const mapping = supabaseUrlToLocal(url);
    if (!mapping) {
      // External URL (e.g. picsum.photos) — keep as-is
      skipped++;
      continue;
    }

    try {
      await downloadImage(url, mapping.localPath);
      urlMap.set(url, mapping.publicUrl);
      downloaded++;
    } catch (err) {
      console.error(`  Failed to download: ${url}`, (err as Error).message);
    }
  }

  console.log(`  Downloaded: ${downloaded}, Skipped external: ${skipped}`);

  // Update URLs in database
  if (urlMap.size > 0) {
    console.log('  Updating URLs in database...');
    // This is a simplified approach — for a small dataset, iterate and update
    for (const post of allPosts) {
      const updates: Record<string, any> = {};
      if (post.hero_image_url && urlMap.has(post.hero_image_url)) {
        updates.hero_image_url = urlMap.get(post.hero_image_url);
      }
      if (post.og_image_url && urlMap.has(post.og_image_url)) {
        updates.og_image_url = urlMap.get(post.og_image_url);
      }
      if (post.gallery_images) {
        const newGallery = post.gallery_images.map((url: string) => urlMap.get(url) || url);
        if (JSON.stringify(newGallery) !== JSON.stringify(post.gallery_images)) {
          updates.gallery_images = newGallery;
        }
      }

      if (Object.keys(updates).length > 0) {
        const { eq } = await import('drizzle-orm');
        await db.update(posts).set(updates).where(eq(posts.id, post.id));
      }
    }
    console.log('  URLs updated');
  }
}

async function main() {
  console.log('=== Supabase → PostgreSQL Migration ===');
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Uploads: ${UPLOADS_DIR}`);

  // 1. Migrate users
  await migrateTable('users', async (rows) => {
    for (const row of rows) {
      await db
        .insert(users)
        .values({
          id: row.id,
          email: row.email,
          password_hash: row.password_hash,
          role: row.role,
          created_at: new Date(row.created_at),
        })
        .onConflictDoNothing();
    }
  });

  // 2. Migrate posts
  const allPosts = await migrateTable('posts', async (rows) => {
    for (const row of rows) {
      await db
        .insert(posts)
        .values({
          id: row.id,
          title: row.title,
          slug: row.slug,
          status: row.status,
          featured: row.featured,
          seo_title: row.seo_title,
          seo_description: row.seo_description,
          og_image_url: row.og_image_url,
          hero_image_url: row.hero_image_url,
          hero_title: row.hero_title,
          hero_subtitle: row.hero_subtitle,
          hero_tags: row.hero_tags,
          hero_location: row.hero_location,
          hero_year: row.hero_year,
          gallery_images: row.gallery_images,
          created_at: new Date(row.created_at),
          updated_at: new Date(row.updated_at),
          deleted_at: row.deleted_at ? new Date(row.deleted_at) : null,
        })
        .onConflictDoNothing();
    }
  });

  // 3. Migrate blocks
  const allBlocks = await migrateTable('blocks', async (rows) => {
    for (const row of rows) {
      await db
        .insert(blocks)
        .values({
          id: row.id,
          post_id: row.post_id,
          type: row.type,
          data: row.data,
          sort_order: row.sort_order,
          created_at: new Date(row.created_at),
        })
        .onConflictDoNothing();
    }
  });

  // 4. Migrate activity_logs
  await migrateTable('activity_logs', async (rows) => {
    for (const row of rows) {
      await db
        .insert(activityLogs)
        .values({
          id: row.id,
          user_email: row.user_email,
          action: row.action,
          entity_type: row.entity_type,
          entity_id: row.entity_id,
          entity_title: row.entity_title,
          changes: row.changes,
          created_at: new Date(row.created_at),
        })
        .onConflictDoNothing();
    }
  });

  // 5. Migrate contact_messages
  await migrateTable('contact_messages', async (rows) => {
    for (const row of rows) {
      await db
        .insert(contactMessages)
        .values({
          id: row.id,
          name: row.name,
          email: row.email,
          subject: row.subject,
          message: row.message,
          telegram_sent: row.telegram_sent,
          telegram_message_id: row.telegram_message_id,
          created_at: new Date(row.created_at),
        })
        .onConflictDoNothing();
    }
  });

  // 6. Migrate images
  await migrateImages(allPosts, allBlocks);

  console.log('\n=== Migration complete ===');
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  pool.end().then(() => process.exit(1));
});
