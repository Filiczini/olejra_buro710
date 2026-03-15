import { useState, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import type { BlockData, ThreeImagesData } from '../../../../types/block';

interface ThreeImagesEditorProps {
  data: ThreeImagesData;
  onChange: (data: BlockData) => void;
  onImageChange: (file: File | null, field: string) => void;
}

export default function ThreeImagesEditor({
  data,
  onChange,
  onImageChange,
}: ThreeImagesEditorProps) {
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [hasNewImage, setHasNewImage] = useState<boolean[]>([false, false, false]);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const images = data.images || [
    { url: '', alt: '' },
    { url: '', alt: '' },
    { url: '', alt: '' },
  ];

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => {
          const next = [...prev];
          next[index] = reader.result as string;
          return next;
        });
        setHasNewImage((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      };
      reader.onerror = () => {
        setPreviews((prev) => {
          const next = [...prev];
          next[index] = null;
          return next;
        });
      };
      reader.readAsDataURL(file);
      onImageChange(file, `images.${index}`);
    }
  };

  const handleRemove = (index: number) => {
    setPreviews((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setHasNewImage((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
    onImageChange(null, `images.${index}`);
    const updated = [...images];
    updated[index] = { url: '', alt: '' };
    onChange({ ...data, images: updated });
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current.value = '';
    }
  };

  const updateAlt = (index: number, alt: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], alt };
    onChange({ ...data, images: updated });
  };

  const getDisplayUrl = (index: number) => {
    return hasNewImage[index] ? previews[index] : images[index]?.url;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700">Зображення</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((index) => {
          const displayUrl = getDisplayUrl(index);
          return (
            <div key={index} className="space-y-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Image {index + 1}
              </span>

              {displayUrl ? (
                <div className="relative group">
                  <img
                    src={displayUrl}
                    alt={images[index]?.alt || `Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-zinc-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <label className="p-2 bg-white text-zinc-700 rounded-full cursor-pointer hover:bg-zinc-100 transition-colors">
                      <Icon icon="solar:cloud-upload-linear" width={20} />
                      <input
                        ref={fileInputRefs[index]}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleFileChange(index, e)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-2 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                    >
                      <Icon icon="solar:close-circle-linear" width={20} />
                    </button>
                  </div>
                  {hasNewImage[index] && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                      Нове зображення
                    </span>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors">
                  <Icon icon="solar:cloud-upload-linear" width={32} className="text-zinc-400" />
                  <span className="mt-2 text-xs text-zinc-500">Завантажити</span>
                  <span className="text-xs text-zinc-400 mt-1">JPEG, PNG</span>
                  <input
                    ref={fileInputRefs[index]}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileChange(index, e)}
                    className="hidden"
                  />
                </label>
              )}

              <input
                type="text"
                value={images[index]?.alt || ''}
                onChange={(e) => updateAlt(index, e.target.value)}
                placeholder={`Alt-текст ${index + 1}`}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
