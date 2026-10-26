import path from 'path';
import sharp from 'sharp';

/** Widths of the smaller copies stored next to every image as `<name>-<width>.webp`. */
export const VARIANT_WIDTHS = [400, 1000] as const;
export const MAX_WIDTH = 2000;
const WEBP_QUALITY = 80;
/** Rejects decompression bombs: a 10 MB PNG can otherwise decode to >1 GB of pixels. */
const MAX_INPUT_PIXELS = 40_000_000;
/** Images processed at once — each one runs three sharp pipelines in parallel. */
const MAX_CONCURRENT_IMAGES = 2;

let activeImages = 0;
const waiting: (() => void)[] = [];

async function withImageSlot<T>(task: () => Promise<T>): Promise<T> {
  if (activeImages >= MAX_CONCURRENT_IMAGES) {
    // The finishing task transfers its slot to us, so the count stays correct
    await new Promise<void>((resolve) => waiting.push(resolve));
  } else {
    activeImages++;
  }
  try {
    return await task();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else activeImages--;
  }
}

export interface ProcessedImage {
  main: Buffer;
  variants: { width: number; buffer: Buffer }[];
}

function toWebp(input: Buffer, width: number): Promise<Buffer> {
  return sharp(input, { failOn: 'error', limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/** Re-encodes an image to WebP (max 2000px) plus 400px/1000px variants. */
export function processImage(input: Buffer): Promise<ProcessedImage> {
  return withImageSlot(async () => {
    const [main, ...variants] = await Promise.all([
      toWebp(input, MAX_WIDTH),
      ...VARIANT_WIDTHS.map((width) => toWebp(input, width)),
    ]);
    return {
      main,
      variants: variants.map((buffer, i) => ({ width: VARIANT_WIDTHS[i], buffer })),
    };
  });
}

/** Path of a variant file derived from the original file path. */
export function variantPath(filePath: string, width: number): string {
  return path.join(path.dirname(filePath), `${path.parse(filePath).name}-${width}.webp`);
}
