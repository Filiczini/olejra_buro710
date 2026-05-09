import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@iconify-icon/react';
import type {
  Block,
  BlockType,
  BlockData,
  TextFullData,
  ImageFullData,
  TextImageData,
  ThreeImagesData,
} from '@buro710/shared';
import TextFullEditor from './editors/TextFullEditor';
import ImageFullEditor from './editors/ImageFullEditor';
import TextImageEditor from './editors/TextImageEditor';
import ThreeImagesEditor from './editors/ThreeImagesEditor';

interface BlockItemProps {
  block: Block;
  index: number;
  onUpdate: (id: string, data: BlockData) => void;
  onDelete: (id: string) => void;
  onImageChange: (blockId: string, file: File | null, field?: string) => void;
}

const BLOCK_LABELS: Record<BlockType, string> = {
  text_full: 'Текст на повну ширину',
  image_full: 'Зображення на повну ширину',
  text_image: 'Текст + Зображення',
  image_text: 'Зображення + Текст',
  three_images: 'Три зображення',
};

const BLOCK_ICONS_MAP: Record<BlockType, string> = {
  text_full: 'solar:text-linear',
  image_full: 'solar:gallery-wide-linear',
  text_image: 'solar:layout-left-linear',
  image_text: 'solar:layout-right-linear',
  three_images: 'solar:gallery-minimalistic-linear',
};

export default function BlockItem({
  block,
  index,
  onUpdate,
  onDelete,
  onImageChange,
}: BlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (confirm('Видалити цей блок?')) {
      onDelete(block.id);
    }
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'text_full':
        return (
          <TextFullEditor
            blockId={block.id}
            data={block.data as TextFullData}
            onChange={(data) => onUpdate(block.id, data)}
          />
        );
      case 'image_full':
        return (
          <ImageFullEditor
            blockId={block.id}
            data={block.data as ImageFullData}
            onChange={(data) => onUpdate(block.id, data)}
            onImageChange={(file) => onImageChange(block.id, file)}
          />
        );
      case 'text_image':
        return (
          <TextImageEditor
            blockId={block.id}
            data={block.data as TextImageData}
            onChange={(data) => onUpdate(block.id, data)}
            onImageChange={(file) => onImageChange(block.id, file)}
            mirrored={false}
          />
        );
      case 'image_text':
        return (
          <TextImageEditor
            blockId={block.id}
            data={block.data as TextImageData}
            onChange={(data) => onUpdate(block.id, data)}
            onImageChange={(file) => onImageChange(block.id, file)}
            mirrored
          />
        );
      case 'three_images':
        return (
          <ThreeImagesEditor
            blockId={block.id}
            data={block.data as ThreeImagesData}
            onChange={(data) => onUpdate(block.id, data)}
            onImageChange={(file, field) => onImageChange(block.id, file, field)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-pointer cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Перетягнути блок"
          >
            <Icon icon="solar:hamburger-menu-linear" width={20} />
          </button>
          <div className="flex items-center gap-2">
            <Icon icon={BLOCK_ICONS_MAP[block.type]} width={18} className="text-zinc-500" />
            <span className="font-medium text-zinc-700">{BLOCK_LABELS[block.type]}</span>
            <span className="text-xs text-zinc-400">#{index + 1}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
          aria-label="Видалити блок"
        >
          <Icon icon="solar:trash-bin-trash-linear" width={20} />
        </button>
      </div>
      <div className="p-4">{renderEditor()}</div>
    </div>
  );
}
