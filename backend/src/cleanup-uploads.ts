/**
 * Garbage-collect orphaned files in UPLOADS_DIR.
 *
 * Collects every image URL referenced in the database (posts hero/og/gallery +
 * block data), then deletes files under UPLOADS_DIR that nothing references and
 * that are older than MIN_AGE_MS (so in-flight uploads are never touched).
 *
 * Usage: npm run cleanup:uploads [-- --dry-run]
 */
import 'dotenv/config';
import path from 'path';
import fs from 'fs/promises';
import { db, pool } from './db';
import { posts, blocks } from './db/schema';

const uploadsDir = process.env.UPLOADS_DIR || '/app/uploads';
const MIN_AGE_MS = 24 * 60 * 60 * 1000; // 24h
const dryRun = process.argv.includes('--dry-run');

function urlToRelPath(url: string): string | null {
  if (!url.startsWith('/uploads/')) return null;
  return url.replace('/uploads/', '');
}

async function collectReferencedPaths(): Promise<Set<string>> {
  const referenced = new Set<string>();

  const postRows = await db
    .select({
      hero_image_url: posts.hero_image_url,
      og_image_url: posts.og_image_url,
      gallery_images: posts.gallery_images,
    })
    .from(posts);

  for (const row of postRows) {
    for (const url of [row.hero_image_url, row.og_image_url, ...(row.gallery_images || [])]) {
      const rel = url ? urlToRelPath(url) : null;
      if (rel) referenced.add(rel);
    }
  }

  const blockRows = await db.select({ data: blocks.data }).from(blocks);

  for (const row of blockRows) {
    const data = row.data as Record<string, unknown>;
    if (typeof data.image_url === 'string') {
      const rel = urlToRelPath(data.image_url);
      if (rel) referenced.add(rel);
    }
    if (Array.isArray(data.images)) {
      for (const img of data.images as { url?: unknown }[]) {
        if (img && typeof img.url === 'string') {
          const rel = urlToRelPath(img.url);
          if (rel) referenced.add(rel);
        }
      }
    }
  }

  return referenced;
}

async function listFiles(dir: string, base = ''): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path.join(dir, entry.name), rel)));
    } else {
      files.push(rel);
    }
  }
  return files;
}

async function main() {
  const referenced = await collectReferencedPaths();
  console.log(`Referenced files in DB: ${referenced.size}`);

  const allFiles = await listFiles(uploadsDir);
  console.log(`Files on disk: ${allFiles.length}`);

  const now = Date.now();
  let deleted = 0;
  let kept = 0;

  for (const rel of allFiles) {
    if (referenced.has(rel)) {
      kept++;
      continue;
    }

    const fullPath = path.join(uploadsDir, rel);
    const stat = await fs.stat(fullPath);
    if (now - stat.mtimeMs < MIN_AGE_MS) {
      kept++;
      continue; // too fresh — may belong to an in-flight request
    }

    if (dryRun) {
      console.log(`[dry-run] would delete: ${rel}`);
    } else {
      await fs.unlink(fullPath);
      console.log(`Deleted orphan: ${rel}`);
    }
    deleted++;
  }

  console.log(`${dryRun ? 'Would delete' : 'Deleted'}: ${deleted}, kept: ${kept}`);
  await pool.end();
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
