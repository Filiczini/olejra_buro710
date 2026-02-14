import { useState, useCallback, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';

interface GalleryUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  label?: string;
}

interface ImageItem {
  id: string;
  url: string;
  isNew: boolean;
  file?: File;
}

export default function GalleryUploader({
  images,
  onImagesChange,
  newFiles,
  onNewFilesChange,
  label = 'Галерея',
}: GalleryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const items: ImageItem[] = [
      ...images.map((url, index) => ({
        id: `existing-${index}-${url}`,
        url,
        isNew: false,
      })),
      ...newFiles.map((file, index) => ({
        id: `new-${index}-${file.name}`,
        url: URL.createObjectURL(file),
        isNew: true,
        file,
      })),
    ];
    setImageItems(items);

    return () => {
      items.forEach(item => {
        if (item.isNew) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [images, newFiles]);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024;

    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const validFiles = Array.from(files).filter(validateFile);
      onNewFilesChange([...newFiles, ...validFiles]);
    },
    [newFiles, onNewFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleRemoveImage = useCallback(
    (item: ImageItem) => {
      if (item.isNew) {
        onNewFilesChange(newFiles.filter(f => f !== item.file));
      } else {
        onImagesChange(images.filter(url => url !== item.url));
      }
    },
    [images, newFiles, onImagesChange, onNewFilesChange]
  );

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOverItem = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...imageItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setImageItems(newItems);
    setDraggedIndex(index);
  }, [draggedIndex, imageItems]);

  const handleDragEnd = useCallback(() => {
    if (draggedIndex === null) return;

    const existingUrls = imageItems
      .filter(item => !item.isNew)
      .map(item => item.url);
    
    const newFilesOrdered = imageItems
      .filter(item => item.isNew && item.file)
      .map(item => item.file!);

    onImagesChange(existingUrls);
    onNewFilesChange(newFilesOrdered);
    setDraggedIndex(null);
  }, [draggedIndex, imageItems, onImagesChange, onNewFilesChange]);

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        {label}
      </h2>

      <div className="flex flex-col gap-6">
        {imageItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imageItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOverItem(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative aspect-[4/5] bg-zinc-100 rounded-lg overflow-hidden group cursor-move ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <img
                  src={item.url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {item.isNew && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                    Нове
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(item)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Видалити"
                >
                  <Icon icon="solar:close-circle-linear" width={16} />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Icon icon="solar:hand-shake-linear" width={12} />
                  Перетягніть
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="gallery-upload"
          />
          <label
            htmlFor="gallery-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <Icon icon="solar:gallery-add-linear" width={48} className="text-zinc-400" />
            <div className="flex flex-col gap-1">
              <p className="text-sm text-zinc-600">
                Перетягніть зображення або{' '}
                <span className="text-zinc-900 font-medium">виберіть файли</span>
              </p>
              <p className="text-xs text-zinc-400">
                JPEG, PNG до 5MB кожне
              </p>
            </div>
          </label>
        </div>

        <p className="text-xs text-zinc-500 text-center">
          Перетягніть зображення для зміни порядку. Галерея відображається внизу сторінки.
        </p>
      </div>
    </section>
  );
}
