import { useState, useCallback, useEffect, useRef } from 'react';
import { compressImage } from '../../lib/compressImage';

interface SingleImageUploadProps {
  image?: File;
  onImageChange: (image: File | null) => void;
  initialImageUrl?: string | null;
  label?: string;
  placeholder?: string;
  error?: string;
}

interface ImagePreview {
  file?: File;
  previewUrl: string;
}

const createPreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export default function SingleImageUpload({
  image,
  onImageChange,
  initialImageUrl,
  label = 'Image',
  placeholder = 'Drag and drop image, or browse',
  error,
}: SingleImageUploadProps) {
  const [preview, setPreview] = useState<ImagePreview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compressMsg, setCompressMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const generatePreview = async () => {
      if (image) {
        const previewUrl = await createPreview(image);
        setPreview({ file: image, previewUrl });
      } else if (initialImageUrl) {
        setPreview({ previewUrl: initialImageUrl });
      } else {
        setPreview(null);
      }
    };

    generatePreview();
  }, [image, initialImageUrl]);

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      return 'Дозволені формати: JPEG, PNG';
    }
    if (file.size > maxSize) {
      return 'Розмір файлу не повинен перевищувати 10 МБ';
    }
    return null;
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0]; // capture synchronously before any await
      const validationError = validateFile(file);

      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      setErrorMessage(null);
      const compressed = await compressImage(file, setCompressMsg);
      onImageChange(compressed);
      setTimeout(() => setCompressMsg(null), 3000);
    },
    [onImageChange]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = '';
    },
    [handleFiles]
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

  const handleRemove = useCallback(() => {
    onImageChange(null);
    setErrorMessage(null);
    setCompressMsg(null);
  }, [onImageChange]);

  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const displayError = error || errorMessage;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="single-image-upload" className="text-sm font-medium text-zinc-700">
        {label}
      </label>

      {/* Always in DOM so htmlFor works and handleReplace always finds it */}
      <input
        ref={fileInputRef}
        id="single-image-upload"
        name="single-image-upload"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full aspect-video bg-zinc-100 rounded-lg overflow-hidden">
          <img src={preview.previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
            title="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleReplace}
            className="absolute bottom-2 right-2 bg-zinc-900 text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium cursor-pointer"
            title="Replace image"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-colors ${
            isDragging ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400'
          } ${displayError ? 'border-red-500' : ''}`}
        >
          <label
            htmlFor="single-image-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <svg
              className="w-12 h-12 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-zinc-600">{placeholder}</p>
              <p className="text-xs text-zinc-400">
                Формати: <span className="font-medium">JPEG, PNG</span> · Авто-стиснення до{' '}
                <span className="font-medium">1 МБ</span>
              </p>
            </div>
          </label>
        </div>
      )}

      {compressMsg && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          {compressMsg.includes('→') ? (
            <svg
              className="w-3.5 h-3.5 text-green-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          <span>{compressMsg}</span>
        </div>
      )}

      {displayError && (
        <div className="flex items-start gap-2 text-sm text-red-500 mt-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
