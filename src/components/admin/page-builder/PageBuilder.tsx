import { useState, useEffect, useCallback } from 'react';
import type { Block, BlockType, BlockData, TextFullData, ImageFullData, TextImageData } from '../../../types/block';
import BlocksList from './BlocksList';
import AddBlockMenu from './AddBlockMenu';

interface PageBuilderProps {
  initialBlocks: Block[];
  onChange: (blocks: { id?: string; type: BlockType; data: BlockData; sort_order: number }[]) => void;
  onImageChange: (blockId: string, file: File | null) => void;
}

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function PageBuilder({ initialBlocks, onChange, onImageChange }: PageBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const notifyChange = useCallback((updatedBlocks: Block[]) => {
    const blocksData = updatedBlocks.map((block, index) => ({
      id: block.id.startsWith('temp-') ? undefined : block.id,
      type: block.type,
      data: block.data,
      sort_order: index,
    }));
    onChange(blocksData);
  }, [onChange]);

  const handleAddBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: generateTempId(),
      post_id: '',
      type,
      data: getDefaultBlockData(type),
      sort_order: blocks.length,
      created_at: new Date().toISOString(),
    };

    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    notifyChange(updatedBlocks);
  };

  const handleUpdateBlock = (id: string, data: BlockData) => {
    const updatedBlocks = blocks.map((block) =>
      block.id === id ? { ...block, data } : block
    );
    setBlocks(updatedBlocks);
    notifyChange(updatedBlocks);
  };

  const handleDeleteBlock = (id: string) => {
    const updatedBlocks = blocks.filter((block) => block.id !== id);
    setBlocks(updatedBlocks);
    notifyChange(updatedBlocks);
  };

  const handleReorderBlocks = (blockIds: string[]) => {
    const reorderedBlocks = blockIds
      .map((id) => blocks.find((b) => b.id === id))
      .filter((b): b is Block => b !== undefined);
    
    setBlocks(reorderedBlocks);
    notifyChange(reorderedBlocks);
  };

  const handleImageChange = (blockId: string, file: File | null) => {
    onImageChange(blockId, file);
  };

  return (
    <div className="space-y-4">
      <BlocksList
        blocks={blocks}
        onUpdateBlock={handleUpdateBlock}
        onDeleteBlock={handleDeleteBlock}
        onReorderBlocks={handleReorderBlocks}
        onImageChange={handleImageChange}
      />
      <AddBlockMenu onAddBlock={handleAddBlock} />
    </div>
  );
}

function getDefaultBlockData(type: BlockType): BlockData {
  switch (type) {
    case 'text_full':
      return { content: '', label: '', area: '', months: '', year: '' } as TextFullData;
    case 'image_full':
      return { image_url: '', alt: '', caption: '' } as ImageFullData;
    case 'text_image':
    case 'image_text':
      return { text: '', image_url: '', image_alt: '', icon: '', label: '', title: '', features: [] } as TextImageData;
  }
}
