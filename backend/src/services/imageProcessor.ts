import path from 'path';
import sharp from 'sharp';

/** Widths of the smaller copies stored next to every image as `<name>-<width>.webp`. */
export const VARIANT_WIDTHS = [400, 1000] as const;
export const MAX_WIDTH = 2000;
const WEBP_QUALITY = 80;

export interface ProcessedImage {
  main: Buffer;
  variants: { width: number; buffer: Buffer }[];
}

function toWebp(input: Buffer, width: number): Promise<Buffer> {
  return sharp(input, { failOn: 'error' })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/** Re-encodes an image to WebP (max 2000px) plus 400px/1000px variants. */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const [main, ...variants] = await Promise.all([
    toWebp(input, MAX_WIDTH),
    ...VARIANT_WIDTHS.map((width) => toWebp(input, width)),
  ]);
  return {
    main,
    variants: variants.map((buffer, i) => ({ width: VARIANT_WIDTHS[i], buffer })),
  };
}

/** Path of a variant file derived from the original file path. */
export function variantPath(filePath: string, width: number): string {
  return path.join(path.dirname(filePath), `${path.parse(filePath).name}-${width}.webp`);
}
