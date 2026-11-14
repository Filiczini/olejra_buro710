import type { Block } from '@buro710/shared';
import { isImageFull, isTextImage, isThreeImages } from './blockTypeGuards';

/** All images of a post in page order: content blocks first, then the gallery (deduplicated). */
export function collectPostImages(blocks: Block[], gallery: string[] = []): string[] {
  const urls: (string | undefined)[] = [];
  for (const block of blocks) {
    if (isImageFull(block)) urls.push(block.data.image_url);
    else if (isTextImage(block)) urls.push(block.data.image_url);
    else if (isThreeImages(block)) urls.push(...(block.data.images ?? []).map((img) => img.url));
  }
  urls.push(...gallery);
  return [...new Set(urls.filter((u): u is string => Boolean(u)))];
}
