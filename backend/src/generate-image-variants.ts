/**
 * Generate responsive WebP variants (<name>-400.webp, <name>-1000.webp) for every
 * image already in UPLOADS_DIR. Originals are never modified or deleted, and files
 * whose variants already exist are skipped, so it is safe to run repeatedly.
 *
 * Usage: npm run images:variants
 */
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { VARIANT_WIDTHS, variantPath } from './services/imageProcessor';

const uploadsDir = process.env.UPLOADS_DIR || '/app/uploads';
const SOURCE_EXT = /\.(jpe?g|png|webp)$/i;
const VARIANT_FILE = /-(?:400|1000)\.webp$/i;
const CONCURRENCY = 4;

async function listFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(full)));
    else files.push(full);
  }
  return files;
}

const exists = (p: string) =>
  fs.access(p).then(
    () => true,
    () => false
  );

async function processFile(file: string): Promise<'done' | 'skipped' | 'failed'> {
  const missing: number[] = [];
  for (const width of VARIANT_WIDTHS) {
    if (!(await exists(variantPath(file, width)))) missing.push(width);
  }
  if (missing.length === 0) return 'skipped';

  try {
    const input = await fs.readFile(file);
    for (const width of missing) {
      const out = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      await fs.writeFile(variantPath(file, width), out);
    }
    return 'done';
  } catch (err) {
    console.error(`Failed: ${file}:`, err instanceof Error ? err.message : err);
    return 'failed';
  }
}

async function main() {
  const files = (await listFiles(uploadsDir)).filter(
    (f) => SOURCE_EXT.test(f) && !VARIANT_FILE.test(f)
  );
  console.log(`Images found: ${files.length}`);

  const counts = { done: 0, skipped: 0, failed: 0 };
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < files.length) {
        const file = files[next++];
        counts[await processFile(file)]++;
      }
    })
  );

  console.log(
    `Variants generated: ${counts.done}, skipped: ${counts.skipped}, failed: ${counts.failed}`
  );
}

main().catch((err) => {
  console.error('Variant generation failed:', err);
  process.exit(1);
});
