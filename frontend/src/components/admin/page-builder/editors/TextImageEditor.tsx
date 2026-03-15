import { useState, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import type { BlockData, TextImageData } from '../../../../types/block';
import { BLOCK_ICONS } from '../../../../types/block';

interface TextImageEditorProps {
  data: TextImageData;
  onChange: (data: BlockData) => void;
  onImageChange: (file: File | null) => void;
  mirrored: boolean;
}

export default function TextImageEditor({
  data,
  onChange,
  onImageChange,
  mirrored,
}: TextImageEditorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasNewImage, setHasNewImage] = useState(false);
  const [newFeature, setNewFeature] = useState('');
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
    onChange({ ...data, image_url: '', image_alt: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateField = (field: keyof TextImageData, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      const features = data.features || [];
      updateField('features', [...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const features = data.features || [];
    updateField(
      'features',
      features.filter((_, i) => i !== index)
    );
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
            <label className="block text-xs font-medium text-zinc-600 mb-1">Іконка</label>
            <select
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
            <label className="block text-xs font-medium text-zinc-600 mb-1">Мітка</label>
            <input
              type="text"
              value={data.label || ''}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="Interior"
              className="w-full px-2 py-1.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Заголовок</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Organic Textures"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Текст</label>
          <textarea
            value={data.text || ''}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Введіть текст..."
            rows={4}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Особливості (features)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              placeholder="Додати особливість"
              className="flex-1 px-2 py-1.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm cursor-pointer"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(data.features || []).map((feature, index) => (
              <span
                key={`${index}-${feature}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-zinc-400 hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={order.image}>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Зображення</label>

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
          onChange={(e) => updateField('image_alt', e.target.value)}
          placeholder="Alt-текст"
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
        />
      </div>
    </div>
  );
}
