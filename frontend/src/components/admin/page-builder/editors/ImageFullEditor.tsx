import { useState, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import type { BlockData, ImageFullData } from '../../../../types/block';

interface ImageFullEditorProps {
  data: ImageFullData;
  onChange: (data: BlockData) => void;
  onImageChange: (file: File | null) => void;
}

export default function ImageFullEditor({ data, onChange, onImageChange }: ImageFullEditorProps) {
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
    onChange({ image_url: '', alt: '', caption: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateField = (field: keyof ImageFullData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Зображення
        </label>
        
        {displayUrl ? (
          <div className="relative group">
            <img
              src={displayUrl}
              alt={data.alt || 'Preview'}
              className="w-full h-48 object-cover rounded-lg border border-zinc-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Icon icon="solar:close-circle-linear" width={20} />
            </button>
            {hasNewImage && (
              <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                Нове зображення
              </span>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors">
            <Icon icon="solar:cloud-upload-linear" width={40} className="text-zinc-400" />
            <span className="mt-2 text-sm text-zinc-500">Натисніть або перетягніть зображення</span>
            <span className="text-xs text-zinc-400 mt-1">JPEG, PNG до 5MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Підпис (caption)
        </label>
        <input
          type="text"
          value={data.caption || ''}
          onChange={(e) => updateField('caption', e.target.value)}
          placeholder="Living Space"
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Alt-текст (опис для SEO)
        </label>
        <input
          type="text"
          value={data.alt || ''}
          onChange={(e) => updateField('alt', e.target.value)}
          placeholder="Опис зображення"
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
    </div>
  );
}
