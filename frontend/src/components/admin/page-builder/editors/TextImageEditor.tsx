import { useState, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import type { BlockData, TextImageData } from '@buro710/shared';
import { BLOCK_ICONS } from '@buro710/shared';
import { compressImage } from '../../../../lib/compressImage';
import FeatureTagsInput from '../../../admin/FeatureTagsInput';

interface TextImageEditorProps {
  blockId: string;
  data: TextImageData;
  onChange: (data: BlockData) => void;
  onImageChange: (file: File | null) => void;
  mirrored: boolean;
}

export default function TextImageEditor({
  blockId,
  data,
  onChange,
  onImageChange,
  mirrored,
}: TextImageEditorProps) {
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
    onChange({ ...data, image_url: '', image_alt: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateField = (field: keyof TextImageData, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const gridCols = 'md:grid-cols-[1fr_1fr]';
  const order = mirrored
    ? { text: 'md:order-2', image: 'md:order-1' }
    : { text: 'md:order-1', image: 'md:order-2' };

  return (
    <div className={`grid ${gridCols} gap-4`}>
      <div className={`${order.text} space-y-3`}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={f('icon')} className="block text-xs font-medium text-zinc-600 mb-1">
              Іконка
            </label>
            <select
              id={f('icon')}
              name={f('icon')}
              value={data.icon || ''}
              onChange={(e) => updateField('icon', e.target.value)}
              className="w-full px-2 py-1.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            >
              <option value="">Без іконки</option>
              {BLOCK_ICONS.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={f('label')} className="block text-xs font-medium text-zinc-600 mb-1">
              Мітка
            </label>
            <input
              id={f('label')}
              name={f('label')}
              type="text"
              value={data.label || ''}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="Interior"
              className="w-full px-2 py-1.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor={f('title')} className="block text-xs font-medium text-zinc-600 mb-1">
            Заголовок
          </label>
          <input
            id={f('title')}
            name={f('title')}
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Organic Textures"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
          />
        </div>

        <div>
          <label htmlFor={f('text')} className="block text-xs font-medium text-zinc-600 mb-1">
            Текст
          </label>
          <textarea
            id={f('text')}
            name={f('text')}
            value={data.text || ''}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Введіть текст..."
            rows={4}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none text-sm"
          />
        </div>

        <FeatureTagsInput
          id={f('new-feature')}
          features={data.features}
          onChange={(features) => updateField('features', features)}
        />
      </div>

      <div className={order.image}>
        <label htmlFor={f('image')} className="block text-sm font-medium text-zinc-700 mb-2">
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
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
          <label
            htmlFor={f('image')}
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors mb-3"
          >
            <Icon icon="solar:cloud-upload-linear" width={32} className="text-zinc-400" />
            <span className="mt-1 text-sm text-zinc-500">Завантажити зображення</span>
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

        {compressMsg && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
            {compressMsg.includes('→') ? (
              <Icon
                icon="solar:check-circle-linear"
                width={14}
                className="text-green-500 flex-shrink-0"
              />
            ) : (
              <Icon icon="solar:spinner-linear" width={14} className="animate-spin flex-shrink-0" />
            )}
            <span>{compressMsg}</span>
          </div>
        )}

        <label htmlFor={f('image-alt')} className="sr-only">
          Alt-текст
        </label>
        <input
          id={f('image-alt')}
          name={f('image-alt')}
          type="text"
          value={data.image_alt || ''}
          onChange={(e) => updateField('image_alt', e.target.value)}
          placeholder="Alt-текст"
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
        />
      </div>
    </div>
  );
}
