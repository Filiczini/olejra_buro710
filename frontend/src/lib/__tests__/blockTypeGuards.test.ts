import { describe, it, expect } from 'vitest';
import type { Block } from '@buro710/shared';
import { isTextFull, isImageFull, isTextImage, isThreeImages } from '../blockTypeGuards';

function makeBlock(overrides: Partial<Block> = {}): Block {
  return {
    id: 'block-1',
    post_id: 'post-1',
    type: 'text_full',
    data: { content: 'hello' },
    sort_order: 0,
    created_at: '2026-07-18T10:00:00.000Z',
    ...overrides,
  };
}

describe('block type guards', () => {
  it('isTextFull matches only text_full blocks', () => {
    expect(isTextFull(makeBlock({ type: 'text_full' }))).toBe(true);
    expect(isTextFull(makeBlock({ type: 'image_full' }))).toBe(false);
  });

  it('isImageFull matches only image_full blocks', () => {
    expect(isImageFull(makeBlock({ type: 'image_full', data: { image_url: 'a.jpg' } }))).toBe(true);
    expect(isImageFull(makeBlock({ type: 'text_full' }))).toBe(false);
  });

  it('isTextImage matches both text_image and image_text blocks', () => {
    const textImage = makeBlock({
      type: 'text_image',
      data: { text: 'hi', image_url: 'a.jpg' },
    });
    const imageText = makeBlock({
      type: 'image_text',
      data: { text: 'hi', image_url: 'a.jpg' },
    });

    expect(isTextImage(textImage)).toBe(true);
    expect(isTextImage(imageText)).toBe(true);
    expect(isTextImage(makeBlock({ type: 'three_images', data: { images: [] } }))).toBe(false);
  });

  it('isThreeImages matches only three_images blocks', () => {
    expect(isThreeImages(makeBlock({ type: 'three_images', data: { images: [] } }))).toBe(true);
    expect(isThreeImages(makeBlock({ type: 'text_full' }))).toBe(false);
  });
});
