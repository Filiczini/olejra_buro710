import { useState, useRef } from 'react';
import { Icon } from '@iconify-icon/react';
import type { BlockData, ThreeImagesData } from '../../../../types/block';
import { compressImage } from '../../../../lib/compressImage';

interface ThreeImagesEditorProps {
  blockId: string;
  data: ThreeImagesData;
  onChange: (data: BlockData) => void;
  onImageChange: (file: File | null, field: string) => void;
}

export default function ThreeImagesEditor({
  blockId,
  data,
  onChange,
  onImageChange,
}: ThreeImagesEditorProps) {
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [hasNewImage, setHasNewImage] = useState<boolean[]>([false, false, false]);
  const [compressMsgs, setCompressMsgs] = useState<(string | null)[]>([null, null, null]);
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

  const setMsg = (index: number, msg: string | null) =>
    setCompressMsgs((prev) => {
      const next = [...prev];
      next[index] = msg;
      return next;
    });

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // capture synchronously before any await
    if (!file) return;

    const compressed = await compressImage(file, (msg) => setMsg(index, msg));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => {
        const n = [...prev];
        n[index] = reader.result as string;
        return n;
      });
      setHasNewImage((prev) => {
        const n = [...prev];
        n[index] = true;
        return n;
      });
      setTimeout(() => setMsg(index, null), 3000);
    };
    reader.onerror = () => {
      setPreviews((prev) => {
        const n = [...prev];
        n[index] = null;
        return n;
      });
      setMsg(index, null);
    };
    reader.readAsDataURL(compressed);
    onImageChange(compressed, `images.${index}`);
  };

  const handleRemove = (index: number) => {
    setPreviews((prev) => {
      const n = [...prev];
      n[index] = null;
      return n;
    });
    setHasNewImage((prev) => {
      const n = [...prev];
      n[index] = false;
      return n;
    });
    setMsg(index, null);
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

  const getDisplayUrl = (index: number) =>
    hasNewImage[index] ? previews[index] : images[index]?.url;

  return (
    <div className="space-y-4">
      <p className="block text-sm font-medium text-zinc-700">Зображення</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((index) => {
          const displayUrl = getDisplayUrl(index);
          const imgId = `${blockId}-img${index}`;
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
                    <label
                      htmlFor={`${imgId}-replace`}
                      className="p-2 bg-white text-zinc-700 rounded-full cursor-pointer hover:bg-zinc-100 transition-colors"
                    >
                      <Icon icon="solar:cloud-upload-linear" width={20} />
                      <input
                        id={`${imgId}-replace`}
                        name={`${imgId}-replace`}
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
                <label
                  htmlFor={`${imgId}-upload`}
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                >
                  <Icon icon="solar:cloud-upload-linear" width={32} className="text-zinc-400" />
                  <span className="mt-2 text-xs text-zinc-500">Завантажити зображення</span>
                  <span className="text-xs text-zinc-400 mt-1">
                    Формати: <span className="font-medium">JPEG, PNG</span>
                  </span>
                  <span className="text-xs text-zinc-400">
                    Авто-стиснення до <span className="font-medium">1 МБ</span>
                  </span>
                  <input
                    id={`${imgId}-upload`}
                    name={`${imgId}-upload`}
                    ref={fileInputRefs[index]}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileChange(index, e)}
                    className="hidden"
                  />
                </label>
              )}

              {compressMsgs[index] && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  {compressMsgs[index]!.includes('→') ? (
                    <Icon
                      icon="solar:check-circle-linear"
                      width={14}
                      className="text-green-500 flex-shrink-0"
                    />
                  ) : (
                    <Icon
                      icon="solar:spinner-linear"
                      width={14}
                      className="animate-spin flex-shrink-0"
                    />
                  )}
                  <span>{compressMsgs[index]}</span>
                </div>
              )}

              <label htmlFor={`${imgId}-alt`} className="sr-only">
                Alt-текст {index + 1}
              </label>
              <input
                id={`${imgId}-alt`}
                name={`${imgId}-alt`}
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
