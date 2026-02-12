import { useState, useCallback, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import type { Media } from '../../types/project';

interface DragDropMediaListProps {
  mediaItems: Media[];
  onReorder: (items: Media[]) => void;
  onRemove: (id: string) => void;
  onAltTextChange?: (id: string, alt: string) => void;
}

interface DragState {
  draggedIndex: number | null;
  draggedOverIndex: number | null;
}

export default function DragDropMediaList({
  mediaItems,
  onReorder,
  onRemove,
  onAltTextChange,
}: DragDropMediaListProps) {
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOverIndex: null,
  });
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const touchThreshold = useRef(50); // Minimum movement to consider as drag

  const handleDragStart = useCallback((index: number) => {
    setDragState({ draggedIndex: index, draggedOverIndex: null });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragState(prev => ({ ...prev, draggedOverIndex: index }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({ ...prev, draggedOverIndex: null }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (dragState.draggedIndex === null) {
        setDragState({ draggedIndex: null, draggedOverIndex: null });
        return;
      }

      const dragIndex = dragState.draggedIndex;

      if (dragIndex === dropIndex) {
        setDragState({ draggedIndex: null, draggedOverIndex: null });
        return;
      }

      // Reorder items
      const newItems = [...mediaItems];
      const [removedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, removedItem);

      // Update sort_order values
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        sort_order: index,
      }));

      onReorder(reorderedItems);
      setDragState({ draggedIndex: null, draggedOverIndex: null });
    },
    [dragState.draggedIndex, mediaItems, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragState({ draggedIndex: null, draggedOverIndex: null });
  }, []);

  // Touch handlers for mobile drag support
  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    setTouchStartIndex(index);
    touchThreshold.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent, index: number) => {
    if (touchStartIndex === null) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchThreshold.current;

    // Only consider it as a drag if moved enough
    if (Math.abs(deltaY) < 30) return;

    setDragState({ draggedIndex: touchStartIndex, draggedOverIndex: index });
  }, [touchStartIndex]);

  const handleTouchEnd = useCallback(() => {
    const { draggedIndex, draggedOverIndex } = dragState;

    if (draggedIndex !== null && draggedOverIndex !== null && draggedIndex !== draggedOverIndex) {
      const newItems = [...mediaItems];
      const [removedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(draggedOverIndex, 0, removedItem);

      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        sort_order: index,
      }));

      onReorder(reorderedItems);
    }

    setDragState({ draggedIndex: null, draggedOverIndex: null });
    setTouchStartIndex(null);
  }, [dragState, mediaItems, onReorder]);

  const handleRemove = useCallback((id: string) => {
    setItemToRemove(id);
  }, []);

  const confirmRemove = useCallback(() => {
    if (itemToRemove) {
      onRemove(itemToRemove);
      setItemToRemove(null);
    }
  }, [itemToRemove, onRemove]);

  const handleAltTextChange = useCallback(
    (id: string, alt: string) => {
      if (onAltTextChange) {
        onAltTextChange(id, alt);
      }
    },
    [onAltTextChange]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <Icon icon="solar:gallery-linear" width={16} />
        <span>Медіа елементи</span>
        <span className="text-zinc-400">({mediaItems.length})</span>
      </div>

      {/* Media List */}
      {mediaItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
          <Icon icon="solar:gallery-add-linear" width={48} className="mx-auto text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-500">Медіа елементів поки немає</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mediaItems.map((media, index) => {
            const isDragging = dragState.draggedIndex === index;
            const isDragOver = dragState.draggedOverIndex === index;

            return (
              <div
                key={media.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={(e) => handleTouchMove(e, index)}
                onTouchEnd={handleTouchEnd}
                className={`
                  relative bg-white border rounded-lg overflow-hidden transition-all duration-200
                  ${isDragging ? 'opacity-50 scale-95 rotate-1 shadow-lg' : ''}
                  ${isDragOver && !isDragging ? 'border-zinc-900 ring-2 ring-zinc-900/20' : 'border-zinc-200'}
                  hover:border-zinc-300 hover:shadow-md
                  cursor-move
                `}
              >
                {/* Drag handle indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-zinc-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start gap-3 p-3">
                  {/* Thumbnail */}
                  <div
                    className={`
                      relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-zinc-100
                      ${isDragging ? 'shadow-md' : ''}
                    `}
                  >
                    <img
                      src={media.url}
                      alt={media.alt || `Media ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Sort order badge */}
                    <div className="absolute top-1 left-1 bg-zinc-900/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Alt text input */}
                    <div>
                      <label
                        htmlFor={`alt-${media.id}`}
                        className="block text-xs font-medium text-zinc-600 mb-1"
                      >
                        Alt текст
                      </label>
                      <input
                        id={`alt-${media.id}`}
                        type="text"
                        value={media.alt || ''}
                        onChange={(e) => handleAltTextChange(media.id, e.target.value)}
                        placeholder="Введіть alt текст для доступності"
                        className="w-full px-2.5 py-1.5 text-sm border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(media.id);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded transition-colors"
                        aria-label="Видалити медіа елемент"
                      >
                        <Icon icon="solar:trash-bin-trash-linear" width={14} />
                        <span>Видалити</span>
                      </button>
                    </div>
                  </div>

                  {/* Drag handle icon */}
                  <div className="flex-shrink-0 pt-1">
                    <div className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                      <Icon icon="solar:drag-handle-linear" width={20} />
                    </div>
                  </div>
                </div>

                {/* Visual drop indicator */}
                {isDragOver && !isDragging && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-zinc-900" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Drag hint */}
      {mediaItems.length > 0 && (
        <p className="text-xs text-zinc-500 text-center flex items-center justify-center gap-1">
          <Icon icon="solar:info-circle-linear" width={14} />
          Перетягніть для зміни порядку
        </p>
      )}

      {/* Remove confirmation modal */}
      {itemToRemove && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setItemToRemove(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Icon icon="solar:danger-triangle-linear" width={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">Видалити медіа</h3>
                <p className="text-sm text-zinc-600">Ви впевнені, що хочете видалити цей медіа елемент?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Підтвердити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
