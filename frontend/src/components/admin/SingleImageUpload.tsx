import { useState, useCallback, useEffect } from 'react';

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
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
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
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Only JPEG and PNG files are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      const validationError = validateFile(file);

      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      setErrorMessage(null);
      onImageChange(file);
    },
    [onImageChange]
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

  const handleRemove = useCallback(() => {
    onImageChange(null);
    setErrorMessage(null);
  }, [onImageChange]);

  const handleReplace = useCallback(() => {
    document.getElementById('single-image-upload')?.click();
  }, []);

  const displayError = error || errorMessage;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-700">{label}</label>

      {/* Image Preview */}
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
        /* Drop zone when no image */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-colors ${
            isDragging ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400'
          } ${displayError ? 'border-red-500' : ''}`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            id="single-image-upload"
          />
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
              <p className="text-sm text-zinc-600">
                {placeholder}, or <span className="text-zinc-900 font-medium">browse</span>
              </p>
              <p className="text-xs text-zinc-400">JPEG, PNG up to 5MB</p>
            </div>
          </label>
        </div>
      )}

      {/* Error message */}
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
