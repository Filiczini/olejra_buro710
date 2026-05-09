import type { EditBlock } from '../types/block';
import type { PostHeroFormData } from '../types/post';
import type { PostStatus } from '@buro710/shared';

interface BlockWithFile {
  id: string;
  file: File | null;
}

interface BuildParams {
  title: string;
  slug: string;
  status: PostStatus;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  heroData: PostHeroFormData;
  ogImageFile: File | null;
  blocksData: EditBlock[];
  blockFiles: BlockWithFile[];
  galleryImages: string[];
  galleryNewFiles: File[];
}

export function buildPostFormData({
  title,
  slug,
  status,
  seoTitle,
  seoDescription,
  featured,
  heroData,
  ogImageFile,
  blocksData,
  blockFiles,
  galleryImages,
  galleryNewFiles,
}: BuildParams): FormData {
  const fd = new FormData();

  fd.append('title', title);
  fd.append('slug', slug);
  fd.append('status', status);
  fd.append('seo_title', seoTitle);
  fd.append('seo_description', seoDescription);
  fd.append('featured', String(featured));
  fd.append('hero_title', heroData.hero_title || '');
  fd.append('hero_subtitle', heroData.hero_subtitle || '');
  fd.append('hero_tags', JSON.stringify(heroData.hero_tags || []));
  fd.append('hero_location', heroData.hero_location || '');
  fd.append('hero_year', heroData.hero_year || '');

  if (heroData.heroImage) fd.append('heroImage', heroData.heroImage);
  if (ogImageFile) fd.append('ogImage', ogImageFile);

  // Build blocks JSON — mark which blocks have new image files so the backend
  // can match uploaded files (appended below in the same iteration order).
  const blocksJson = blocksData.map((block) => {
    const blockId = block.id || block._tempId;

    if (block.type === 'three_images') {
      const newImageSlots: number[] = [];
      for (let i = 0; i < 3; i++) {
        if (blockFiles.find((f) => f.id === `${blockId}__images.${i}`)?.file) {
          newImageSlots.push(i);
        }
      }
      return {
        id: block.id?.startsWith('temp-') ? undefined : block.id,
        _tempId: block._tempId,
        type: block.type,
        data: {
          ...block.data,
          _newImageSlots: newImageSlots.length > 0 ? newImageSlots : undefined,
        },
        sort_order: block.sort_order,
      };
    }

    return {
      id: block.id?.startsWith('temp-') ? undefined : block.id,
      _tempId: block._tempId,
      type: block.type,
      data: {
        ...block.data,
        _hasNewImage: !!blockFiles.find((f) => f.id === blockId)?.file,
      },
      sort_order: block.sort_order,
    };
  });
  fd.append('blocks', JSON.stringify(blocksJson));

  // Append files in the same order blocks are iterated above so the backend's
  // positional fileIndex counter lines up correctly.
  blocksData.forEach((block) => {
    const blockId = block.id || block._tempId;
    if (block.type === 'three_images') {
      for (let i = 0; i < 3; i++) {
        const bf = blockFiles.find((f) => f.id === `${blockId}__images.${i}`);
        if (bf?.file) fd.append('blockImages', bf.file);
      }
    } else {
      const bf = blockFiles.find((f) => f.id === blockId);
      if (bf?.file) fd.append('blockImages', bf.file);
    }
  });

  fd.append('gallery_images', JSON.stringify(galleryImages));
  galleryNewFiles.forEach((file) => fd.append('galleryImages', file));

  return fd;
}
