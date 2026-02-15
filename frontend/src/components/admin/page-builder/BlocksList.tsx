import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Block, BlockData } from '../../../types/block';
import BlockItem from './BlockItem';

interface BlocksListProps {
  blocks: Block[];
  onUpdateBlock: (id: string, data: BlockData) => void;
  onDeleteBlock: (id: string) => void;
  onReorderBlocks: (blockIds: string[]) => void;
  onImageChange: (blockId: string, file: File | null, field?: string) => void;
}

export default function BlocksList({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  onImageChange,
}: BlocksListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newBlocks = [...blocks];
      const [removed] = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, removed);

      onReorderBlocks(newBlocks.map((b) => b.id));
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
        <p className="text-zinc-500">Додайте перший блок для створення сторінки</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <BlockItem
              key={block.id}
              block={block}
              index={index}
              onUpdate={onUpdateBlock}
              onDelete={onDeleteBlock}
              onImageChange={onImageChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
