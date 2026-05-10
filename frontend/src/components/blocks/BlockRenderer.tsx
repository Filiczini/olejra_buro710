import { memo } from 'react';
import type { Block } from '@buro710/shared';
import { isTextFull, isImageFull, isTextImage, isThreeImages } from '../../lib/blockTypeGuards';
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
        if (isTextFull(block)) return <TextFullBlock key={block.id} data={block.data} />;
        if (isImageFull(block)) return <ImageFullBlock key={block.id} data={block.data} />;
        if (isTextImage(block))
          return (
            <TextImageBlock
              key={block.id}
              data={block.data}
              mirrored={block.type === 'image_text'}
            />
          );
        if (isThreeImages(block)) return <ThreeImagesBlock key={block.id} data={block.data} />;
        return null;
      })}
    </div>
  );
});
