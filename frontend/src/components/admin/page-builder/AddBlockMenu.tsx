import { useState } from 'react';
import { Icon } from '@iconify-icon/react';
import type { BlockType } from '../../../types/block';

interface AddBlockMenuProps {
  onAddBlock: (type: BlockType) => void;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; description: string }[] = [
  {
    type: 'text_full',
    label: 'Текст на повну ширину',
    icon: 'solar:text-linear',
    description: 'Текстовий блок без зображень',
  },
  {
    type: 'image_full',
    label: 'Зображення на повну ширину',
    icon: 'solar:gallery-wide-linear',
    description: 'Велике зображення на всю ширину',
  },
  {
    type: 'text_image',
    label: 'Текст + Зображення',
    icon: 'solar:layout-left-linear',
    description: 'Текст зліва, зображення справа',
  },
  {
    type: 'image_text',
    label: 'Зображення + Текст',
    icon: 'solar:layout-right-linear',
    description: 'Зображення зліва, текст справа',
  },
  {
    type: 'three_images',
    label: 'Три зображення',
    icon: 'solar:gallery-minimalistic-linear',
    description: 'Три зображення в ряд',
  },
];

export default function AddBlockMenu({ onAddBlock }: AddBlockMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (type: BlockType) => {
    onAddBlock(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-300 rounded-lg text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
      >
        <Icon icon="solar:add-circle-linear" width={20} />
        <span>Додати блок</span>
        <Icon
          icon={isOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
          width={16}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 z-20 overflow-hidden">
            {BLOCK_TYPES.map((blockType) => (
              <button
                key={blockType.type}
                type="button"
                onClick={() => handleSelect(blockType.type)}
                className="w-full flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors text-left border-b border-zinc-100 last:border-b-0 cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <Icon icon={blockType.icon} width={24} className="text-zinc-600" />
                </div>
                <div>
                  <div className="font-medium text-zinc-900">{blockType.label}</div>
                  <div className="text-sm text-zinc-500">{blockType.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
