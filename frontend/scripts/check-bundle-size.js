import { statSync, readdirSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist');
const maxSizeBytes = 1 * 1024 * 1024; // 1 MB per file
const maxTotalBytes = 5 * 1024 * 1024; // 5 MB total

function getDirSize(dir) {
  let total = 0;
  const files = readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const full = join(dir, file.name);
    if (file.isDirectory()) {
      total += getDirSize(full);
    } else {
      total += statSync(full).size;
      if (statSync(full).size > maxSizeBytes) {
        console.error(`Bundle size gate failed: ${full} is ${(statSync(full).size / 1024 / 1024).toFixed(2)}MB (max ${maxSizeBytes / 1024 / 1024}MB)`);
        process.exit(1);
      }
    }
  }
  return total;
}

const total = getDirSize(distPath);
console.log(`Bundle total: ${(total / 1024 / 1024).toFixed(2)}MB (max ${maxTotalBytes / 1024 / 1024}MB)`);

if (total > maxTotalBytes) {
  console.error(`Bundle size gate failed: total dist is ${(total / 1024 / 1024).toFixed(2)}MB (max ${maxTotalBytes / 1024 / 1024}MB)`);
  process.exit(1);
}

console.log('Bundle size gate passed.');
