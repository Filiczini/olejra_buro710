import type { Block } from '../../types/block';
import TextFullBlock from './TextFullBlock';
import ImageFullBlock from './ImageFullBlock';
import TextImageBlock from './TextImageBlock';

interface BlockRendererProps {
  blocks: Block[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="w-full">
      {blocks.map((block) => {
        switch (block.type) {
          case 'text_full':
            return (
              <TextFullBlock
                key={block.id}
                content={(block.data as { content: string }).content}
              />
            );
          case 'image_full':
            return (
              <ImageFullBlock
                key={block.id}
                image_url={(block.data as { image_url: string }).image_url}
                alt={(block.data as { alt?: string }).alt}
              />
            );
          case 'text_image':
            return (
              <TextImageBlock
                key={block.id}
                text={(block.data as { text: string }).text}
                image_url={(block.data as { image_url: string }).image_url}
                image_alt={(block.data as { image_alt?: string }).image_alt}
                mirrored={false}
              />
            );
          case 'image_text':
            return (
              <TextImageBlock
                key={block.id}
                text={(block.data as { text: string }).text}
                image_url={(block.data as { image_url: string }).image_url}
                image_alt={(block.data as { image_alt?: string }).image_alt}
                mirrored
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
