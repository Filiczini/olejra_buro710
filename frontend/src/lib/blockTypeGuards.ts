import type {
  Block,
  TextFullData,
  ImageFullData,
  TextImageData,
  ThreeImagesData,
} from '@buro710/shared';

export function isTextFull(block: Block): block is Block & { data: TextFullData } {
  return block.type === 'text_full';
}

export function isImageFull(block: Block): block is Block & { data: ImageFullData } {
  return block.type === 'image_full';
}

export function isTextImage(block: Block): block is Block & { data: TextImageData } {
  return block.type === 'text_image' || block.type === 'image_text';
}

export function isThreeImages(block: Block): block is Block & { data: ThreeImagesData } {
  return block.type === 'three_images';
}
