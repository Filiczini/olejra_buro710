import { useState, useCallback, useEffect } from 'react';

interface MultiImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxCount?: number;
  label?: string;
  placeholder?: string;
  error?: string;
}

interface ImagePreview {
  file: File;
  previewUrl: string;
}

export default function MultiImageUpload({
  images,
  onImagesChange,
  maxCount = 10,
  label = 'Images',
  placeholder = 'Drag and drop images, or browse',
  error,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate previews when images prop changes
  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews: ImagePreview[] = await Promise.all(
        images.map(async (file) => ({
          file,
          previewUrl: await createPreview(file),
        }))
      );
      setPreviews(newPreviews);
    };

    generatePreviews();
  }, [images]);

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Only JPEG and PNG files are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    if (images.length >= maxCount) {
      return `Maximum ${maxCount} images allowed`;
    }

    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const validFiles: File[] = [];
      const errorMessages: string[] = [];

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errorMessages.push(`${file.name}: ${validationError}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errorMessages.length > 0) {
        setErrorMessage(errorMessages.join('; '));
      } else {
        setErrorMessage(null);
      }

      if (validFiles.length > 0) {
        onImagesChange([...images, ...validFiles]);
      }
    },
    [images, maxCount, onImagesChange]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
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

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      const newImages = images.filter((_, index) => index !== indexToRemove);
      onImagesChange(newImages);
      setErrorMessage(null);
    },
    [images, onImagesChange]
  );

  const displayError = error || errorMessage;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">{label}</label>
        {maxCount && (
          <span className="text-xs text-zinc-500">
            {images.length} / {maxCount}
          </span>
        )}
      </div>

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="relative group aspect-square bg-zinc-100 rounded-lg overflow-hidden"
            >
              <img
                src={preview.previewUrl}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Remove image ${index + 1}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}

          {/* Upload button when not at max count */}
          {images.length < maxCount && (
            <label className="aspect-square border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1 text-zinc-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-xs">Add</span>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Drop zone when no images */}
      {previews.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-colors ${
            isDragging
              ? 'border-zinc-900 bg-zinc-50'
              : 'border-zinc-300 hover:border-zinc-400'
          } ${displayError ? 'border-red-500' : ''}`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            multiple
            className="hidden"
            id="multi-image-upload"
          />
          <label
            htmlFor="multi-image-upload"
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
              <p className="text-sm text-zinc-600">
                {placeholder}, or{' '}
                <span className="text-zinc-900 font-medium">browse</span>
              </p>
              <p className="text-xs text-zinc-400">
                JPEG, PNG up to 5MB each (max {maxCount} images)
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <div className="flex items-start gap-2 text-sm text-red-500 mt-1">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
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
