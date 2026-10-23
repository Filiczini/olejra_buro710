import { describe, it, expect } from 'vitest';
import { getImageSrcSet } from '../imageVariants';

describe('getImageSrcSet', () => {
  it('builds 400/1000 variants plus the original for uploaded images', () => {
    expect(getImageSrcSet('/uploads/blocks/123-abc.jpg')).toBe(
      '/uploads/blocks/123-abc-400.webp 400w, /uploads/blocks/123-abc-1000.webp 1000w, /uploads/blocks/123-abc.jpg 2000w'
    );
  });

  it('works for webp uploads', () => {
    expect(getImageSrcSet('/uploads/posts/1-a.webp')).toContain('/uploads/posts/1-a-400.webp 400w');
  });

  it('returns undefined for non-upload or empty URLs', () => {
    expect(getImageSrcSet('https://example.com/img.jpg')).toBeUndefined();
    expect(getImageSrcSet('/about-person.webp')).toBeUndefined();
    expect(getImageSrcSet(null)).toBeUndefined();
  });
});
