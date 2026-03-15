import { memo } from 'react';
import type {
  Block,
  TextFullData,
  ImageFullData,
  TextImageData,
  ThreeImagesData,
} from '../../types/block';
import TextFullBlock from './TextFullBlock';
import ImageFullBlock from './ImageFullBlock';
import TextImageBlock from './TextImageBlock';
import ThreeImagesBlock from './ThreeImagesBlock';

interface BlockRendererProps {
  blocks: Block[];
}

export default memo(function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="w-full">
      {blocks.map((block) => {
        switch (block.type) {
          case 'text_full':
            return <TextFullBlock key={block.id} data={block.data as TextFullData} />;
          case 'image_full':
            return <ImageFullBlock key={block.id} data={block.data as ImageFullData} />;
          case 'text_image':
            return (
              <TextImageBlock key={block.id} data={block.data as TextImageData} mirrored={false} />
            );
          case 'image_text':
            return <TextImageBlock key={block.id} data={block.data as TextImageData} mirrored />;
          case 'three_images':
            return <ThreeImagesBlock key={block.id} data={block.data as ThreeImagesData} />;
          default:
            return null;
        }
      })}
    </div>
  );
});
