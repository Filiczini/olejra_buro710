import { useState, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import type { BlockData } from '../../../../types/block';

interface TextImageEditorProps {
  data: { text: string; image_url: string; image_alt?: string };
  onChange: (data: BlockData) => void;
  onImageChange: (file: File | null) => void;
  mirrored: boolean;
}

export default function TextImageEditor({ data, onChange, onImageChange, mirrored }: TextImageEditorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasNewImage, setHasNewImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = hasNewImage ? previewUrl : data.image_url;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setHasNewImage(true);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setHasNewImage(false);
    onImageChange(null);
    onChange({ text: data.text, image_url: '', image_alt: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextChange = (value: string) => {
    onChange({ text: value, image_url: data.image_url, image_alt: data.image_alt });
  };

  const handleAltChange = (value: string) => {
    onChange({ text: data.text, image_url: data.image_url, image_alt: value });
  };

  const gridCols = 'md:grid-cols-[1fr_1fr]';
  const order = mirrored ? { text: 'md:order-2', image: 'md:order-1' } : { text: 'md:order-1', image: 'md:order-2' };

  return (
    <div className={`grid ${gridCols} gap-4`}>
      <div className={order.text}>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Текст
        </label>
        <textarea
          value={data.text || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Введіть текст..."
          rows={6}
          className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
        />
      </div>

      <div className={order.image}>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Зображення
        </label>
        
        {displayUrl ? (
          <div className="relative group mb-3">
            <img
              src={displayUrl}
              alt={data.image_alt || 'Preview'}
              className="w-full h-40 object-cover rounded-lg border border-zinc-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon icon="solar:close-circle-linear" width={18} />
            </button>
            {hasNewImage && (
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                Нове
              </span>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors mb-3">
            <Icon icon="solar:cloud-upload-linear" width={32} className="text-zinc-400" />
            <span className="mt-1 text-sm text-zinc-500">Завантажити</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        <input
          type="text"
          value={data.image_alt || ''}
          onChange={(e) => handleAltChange(e.target.value)}
          placeholder="Alt-текст"
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
        />
      </div>
    </div>
  );
}
