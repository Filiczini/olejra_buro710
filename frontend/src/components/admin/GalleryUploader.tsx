import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { compressImage } from '../../lib/compressImage';
import GalleryPreview from './GalleryPreview';
import GalleryDropzone from './GalleryDropzone';

interface GalleryUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  label?: string;
}

export interface ImageItem {
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [reorderedItems, setReorderedItems] = useState<ImageItem[] | null>(null);
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
  const [compressMsg, setCompressMsg] = useState<string | null>(null);
  const prevBlobUrlsRef = useRef<Set<string>>(new Set());

  const computedItems: ImageItem[] = useMemo(
    () => [
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
    ],
    [images, newFiles]
  );

  useEffect(() => {
    const currentBlobUrls = new Set(
      computedItems.filter((item) => item.isNew).map((item) => item.url)
    );

    const urlsToRevoke = [...prevBlobUrlsRef.current].filter((url) => !currentBlobUrls.has(url));
    urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));

    prevBlobUrlsRef.current = currentBlobUrls;

    return () => {
      prevBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [computedItems]);

  const imageItems = reorderedItems ?? computedItems;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024;
      const valid: File[] = [];
      const rejected: string[] = [];

      Array.from(files).forEach((file) => {
        if (!validTypes.includes(file.type)) {
          rejected.push(`${file.name}: тільки JPEG та PNG`);
        } else if (file.size > maxSize) {
          rejected.push(`${file.name}: перевищує 10 МБ`);
        } else {
          valid.push(file);
        }
      });

      setRejectedFiles(rejected);
      if (valid.length === 0) return;

      const needsCompression = valid.filter((f) => f.size > 1 * 1024 * 1024);
      if (needsCompression.length > 0) {
        setCompressMsg(`Стискаємо ${needsCompression.length} з ${valid.length} фото...`);
      }

      let totalOriginal = 0;
      let totalCompressed = 0;
      const compressed = await Promise.all(
        valid.map(async (file) => {
          const result = await compressImage(file);
          totalOriginal += file.size;
          totalCompressed += result.size;
          return result;
        })
      );

      if (needsCompression.length > 0) {
        const fmtMb = (b: number) => (b / (1024 * 1024)).toFixed(1) + ' МБ';
        setCompressMsg(`${fmtMb(totalOriginal)} → ${fmtMb(totalCompressed)}`);
        setTimeout(() => setCompressMsg(null), 3000);
      }

      onNewFilesChange([...newFiles, ...compressed]);
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
        onNewFilesChange(newFiles.filter((f) => f !== item.file));
      } else {
        onImagesChange(images.filter((url) => url !== item.url));
      }
    },
    [images, newFiles, onImagesChange, onNewFilesChange]
  );

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOverItem = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;

      const newItems = [...imageItems];
      const draggedItem = newItems[draggedIndex];
      newItems.splice(draggedIndex, 1);
      newItems.splice(index, 0, draggedItem);
      setReorderedItems(newItems);
      setDraggedIndex(index);
    },
    [draggedIndex, imageItems]
  );

  const handleDragEnd = useCallback(() => {
    if (draggedIndex === null) return;

    const existingUrls = imageItems.filter((item) => !item.isNew).map((item) => item.url);

    const newFilesOrdered = imageItems
      .filter((item) => item.isNew && item.file)
      .map((item) => item.file!);

    onImagesChange(existingUrls);
    onNewFilesChange(newFilesOrdered);
    setDraggedIndex(null);
    setReorderedItems(null);
  }, [draggedIndex, imageItems, onImagesChange, onNewFilesChange]);

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-zinc-900 mb-6 pb-2 border-b border-zinc-200">
        {label}
      </h2>

      <div className="flex flex-col gap-6">
        <GalleryPreview
          items={imageItems}
          draggedIndex={draggedIndex}
          onDragStart={handleDragStart}
          onDragOver={handleDragOverItem}
          onDragEnd={handleDragEnd}
          onRemove={handleRemoveImage}
        />

        <GalleryDropzone
          isDragging={isDragging}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onFileChange={handleFileChange}
          rejectedFiles={rejectedFiles}
          compressMsg={compressMsg}
        />

        <p className="text-xs text-zinc-500 text-center">
          Перетягніть зображення для зміни порядку. Галерея відображається внизу сторінки.
        </p>
      </div>
    </section>
  );
}
