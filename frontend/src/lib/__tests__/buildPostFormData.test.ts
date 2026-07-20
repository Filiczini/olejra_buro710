import { describe, it, expect } from 'vitest';
import { buildPostFormData } from '../buildPostFormData';
import type { EditBlock, BlockWithFile } from '../../types/block';
import type { PostHeroFormData } from '../../types/post';

function file(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

const baseHero: PostHeroFormData = {};

function baseParams(overrides: Partial<Parameters<typeof buildPostFormData>[0]> = {}) {
  return {
    title: 'My post',
    slug: 'my-post',
    status: 'draft' as const,
    seoTitle: '',
    seoDescription: '',
    featured: false,
    heroData: baseHero,
    ogImageFile: null,
    blocksData: [] as EditBlock[],
    blockFiles: [] as BlockWithFile[],
    galleryImages: [] as string[],
    galleryNewFiles: [] as File[],
    ...overrides,
  };
}

function parseBlocks(fd: FormData): Array<Record<string, unknown>> {
  return JSON.parse(fd.get('blocks') as string);
}

describe('buildPostFormData', () => {
  it('appends scalar fields with empty-string fallbacks for missing hero data', () => {
    const fd = buildPostFormData(baseParams());

    expect(fd.get('title')).toBe('My post');
    expect(fd.get('slug')).toBe('my-post');
    expect(fd.get('status')).toBe('draft');
    expect(fd.get('featured')).toBe('false');
    expect(fd.get('hero_title')).toBe('');
    expect(fd.get('hero_subtitle')).toBe('');
    expect(fd.get('hero_location')).toBe('');
    expect(fd.get('hero_year')).toBe('');
    expect(fd.get('hero_tags')).toBe('[]');
  });

  it('serializes provided hero fields and tags', () => {
    const fd = buildPostFormData(
      baseParams({
        heroData: {
          hero_title: 'Title',
          hero_subtitle: 'Subtitle',
          hero_tags: ['a', 'b'],
          hero_location: 'Kyiv',
          hero_year: '2026',
        },
      })
    );

    expect(fd.get('hero_title')).toBe('Title');
    expect(fd.get('hero_tags')).toBe(JSON.stringify(['a', 'b']));
    expect(fd.get('hero_location')).toBe('Kyiv');
    expect(fd.get('hero_year')).toBe('2026');
  });

  it('attaches heroImage and ogImage files only when present', () => {
    const withoutFiles = buildPostFormData(baseParams());
    expect(withoutFiles.get('heroImage')).toBeNull();
    expect(withoutFiles.get('ogImage')).toBeNull();

    const heroFile = file('hero.jpg');
    const ogFile = file('og.jpg');
    const withFiles = buildPostFormData(
      baseParams({ heroData: { heroImage: heroFile }, ogImageFile: ogFile })
    );
    expect(withFiles.get('heroImage')).toBe(heroFile);
    expect(withFiles.get('ogImage')).toBe(ogFile);
  });

  it('clears the id of temp blocks but keeps their _tempId', () => {
    const fd = buildPostFormData(
      baseParams({
        blocksData: [
          {
            id: 'temp-123',
            _tempId: 'temp-123',
            type: 'text_full',
            data: { content: 'hi' },
            sort_order: 0,
          },
        ],
      })
    );

    const [block] = parseBlocks(fd);
    expect(block.id).toBeUndefined();
    expect(block._tempId).toBe('temp-123');
  });

  it('keeps a persisted block id unchanged', () => {
    const fd = buildPostFormData(
      baseParams({
        blocksData: [
          {
            id: 'real-id-1',
            type: 'text_full',
            data: { content: 'hi' },
            sort_order: 0,
          },
        ],
      })
    );

    const [block] = parseBlocks(fd);
    expect(block.id).toBe('real-id-1');
  });

  it('marks a single-image block as having a new image and appends the file in order', () => {
    const newFile = file('new.jpg');
    const fd = buildPostFormData(
      baseParams({
        blocksData: [
          { id: 'b1', type: 'text_full', data: { content: 'a' }, sort_order: 0 },
          {
            id: 'b2',
            type: 'image_full',
            data: { image_url: '' },
            sort_order: 1,
          },
        ],
        blockFiles: [{ id: 'b2', file: newFile }],
      })
    );

    const blocks = parseBlocks(fd);
    expect(blocks[0].data).not.toHaveProperty('_hasNewImage', true);
    expect(blocks[1].data._hasNewImage).toBe(true);
    expect(fd.getAll('blockImages')).toEqual([newFile]);
  });

  it('collects only the filled slots of a three_images block, in slot order', () => {
    const slot0 = file('slot0.jpg');
    const slot2 = file('slot2.jpg');
    const fd = buildPostFormData(
      baseParams({
        blocksData: [
          {
            id: 'b1',
            type: 'three_images',
            data: {
              images: [
                { url: '', alt: '' },
                { url: 'kept.jpg', alt: '' },
                { url: '', alt: '' },
              ],
            },
            sort_order: 0,
          },
        ],
        blockFiles: [
          { id: 'b1__images.0', file: slot0 },
          { id: 'b1__images.2', file: slot2 },
        ],
      })
    );

    const [block] = parseBlocks(fd);
    expect(block.data._newImageSlots).toEqual([0, 2]);
    expect(fd.getAll('blockImages')).toEqual([slot0, slot2]);
  });

  it('serializes gallery_images and appends new gallery files', () => {
    const newImg = file('gallery.jpg');
    const fd = buildPostFormData(
      baseParams({
        galleryImages: ['existing.jpg'],
        galleryNewFiles: [newImg],
      })
    );

    expect(fd.get('gallery_images')).toBe(JSON.stringify(['existing.jpg']));
    expect(fd.getAll('galleryImages')).toEqual([newImg]);
  });
});
