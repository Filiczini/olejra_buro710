import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { processImage, variantPath } from '../imageProcessor';

async function makeJpeg(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 100, b: 50 } },
  })
    .jpeg()
    .toBuffer();
}

describe('processImage', () => {
  it('returns WebP main (max 2000px) and 400/1000px variants', async () => {
    const result = await processImage(await makeJpeg(3000, 2000));

    const main = await sharp(result.main).metadata();
    expect(main.format).toBe('webp');
    expect(main.width).toBe(2000);

    expect(result.variants.map((v) => v.width)).toEqual([400, 1000]);
    for (const v of result.variants) {
      const meta = await sharp(v.buffer).metadata();
      expect(meta.format).toBe('webp');
      expect(meta.width).toBe(v.width);
    }
  });

  it('never upscales small images', async () => {
    const result = await processImage(await makeJpeg(300, 200));
    expect((await sharp(result.main).metadata()).width).toBe(300);
    expect((await sharp(result.variants[0].buffer).metadata()).width).toBe(300);
  });

  it('rejects data that is not an image', async () => {
    await expect(processImage(Buffer.from('not an image'))).rejects.toThrow();
  });
});

describe('variantPath', () => {
  it('derives the variant file name from the original', () => {
    expect(variantPath('/uploads/posts/123-abc.jpg', 400)).toMatch(/123-abc-400\.webp$/);
    expect(variantPath('/uploads/posts/123-abc.webp', 1000)).toMatch(/123-abc-1000\.webp$/);
  });
});
