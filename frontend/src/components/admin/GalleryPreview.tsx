import { Icon } from '@iconify-icon/react';
import type { ImageItem } from './GalleryUploader';

interface GalleryPreviewProps {
  items: ImageItem[];
  draggedIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onRemove: (item: ImageItem) => void;
}

export default function GalleryPreview({
  items,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onRemove,
}: GalleryPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragEnd={onDragEnd}
          className={`relative aspect-[4/5] bg-zinc-100 rounded-lg overflow-hidden group cursor-move ${
            draggedIndex === index ? 'opacity-50' : ''
          }`}
        >
          <img src={item.url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
          {item.isNew && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
              Нове
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
            title="Видалити"
          >
            <Icon icon="solar:close-circle-linear" width={16} />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Icon icon="solar:hand-shake-linear" width={12} />
            Перетягніть
          </div>
        </div>
      ))}
    </div>
  );
}
