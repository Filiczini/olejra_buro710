import { useState } from 'react';
import { ChevronDown, Trash2, X } from 'lucide-react';
import type { PostStatus } from '@buro710/shared';

interface BulkActionsBarProps {
  selectedIds: Set<string>;
  postCountLabel: (n: number) => string;
  onStatusChange: (status: PostStatus) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  bulkLoading: boolean;
}

export default function BulkActionsBar({
  selectedIds,
  postCountLabel,
  onStatusChange,
  onBulkDelete,
  onClearSelection,
  bulkLoading,
}: BulkActionsBarProps) {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (selectedIds.size === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
      <span className="text-sm font-medium">{postCountLabel(selectedIds.size)} обрано</span>
      <div className="w-px h-5 bg-zinc-700" />

      <div className="relative">
        <button
          type="button"
          disabled={bulkLoading}
          onClick={() => setStatusDropdownOpen((v) => !v)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          Змінити статус
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {statusDropdownOpen && (
          <div className="absolute bottom-full mb-2 left-0 bg-white text-zinc-900 rounded-lg shadow-lg overflow-hidden min-w-36">
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(false);
                onStatusChange('published');
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Опублікувати
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(false);
                onStatusChange('draft');
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              В чернетку
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={bulkLoading}
        onClick={onBulkDelete}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Видалити
      </button>

      <button
        type="button"
        onClick={onClearSelection}
        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        title="Зняти виділення"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
