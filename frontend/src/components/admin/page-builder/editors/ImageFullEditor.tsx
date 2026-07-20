import { useState, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import type { BlockData, ImageFullData } from '@buro710/shared';
import { compressImage } from '../../../../lib/compressImage';
import CompressionStatus from '../../CompressionStatus';

interface ImageFullEditorProps {
  blockId: string;
  data: ImageFullData;
  onChange: (data: BlockData) => void;
  onImageChange: (file: File | null) => void;
}

export default function ImageFullEditor({
  blockId,
  data,
  onChange,
  onImageChange,
}: ImageFullEditorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasNewImage, setHasNewImage] = useState(false);
  const [compressMsg, setCompressMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = hasNewImage ? previewUrl : data.image_url;
  const f = (name: string) => `${blockId}-${name}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // capture synchronously before any await
    if (!file) return;

    const compressed = await compressImage(file, setCompressMsg);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        setHasNewImage(true);
        setTimeout(() => setCompressMsg(null), 3000);
      }
    };
    reader.onerror = () => {
      setPreviewUrl(null);
      setCompressMsg(null);
    };
    reader.readAsDataURL(compressed);
    onImageChange(compressed);
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
        <p className="block text-sm font-medium text-zinc-700 mb-2">Зображення</p>

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
          <label
            htmlFor={f('image')}
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
          >
            <Icon icon="solar:cloud-upload-linear" width={40} className="text-zinc-400" />
            <span className="mt-2 text-sm text-zinc-500">Натисніть або перетягніть зображення</span>
            <span className="text-xs text-zinc-400 mt-1">
              Формати: <span className="font-medium">JPEG, PNG</span> · Максимум:{' '}
              <span className="font-medium">10MB</span>
            </span>
            <input
              id={f('image')}
              name={f('image')}
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <CompressionStatus message={compressMsg} />

      <div>
        <label htmlFor={f('caption')} className="block text-sm font-medium text-zinc-700 mb-2">
          Підпис (caption)
        </label>
        <input
          id={f('caption')}
          name={f('caption')}
          type="text"
          value={data.caption || ''}
          onChange={(e) => updateField('caption', e.target.value)}
          placeholder="Living Space"
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label htmlFor={f('alt')} className="block text-sm font-medium text-zinc-700 mb-2">
          Alt-текст (опис для SEO)
        </label>
        <input
          id={f('alt')}
          name={f('alt')}
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
