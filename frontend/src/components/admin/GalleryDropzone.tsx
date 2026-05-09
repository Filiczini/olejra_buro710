import { Icon } from '@iconify-icon/react';

interface GalleryDropzoneProps {
  isDragging: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rejectedFiles: string[];
  compressMsg: string | null;
}

export default function GalleryDropzone({
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileChange,
  rejectedFiles,
  compressMsg,
}: GalleryDropzoneProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400'
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          onChange={onFileChange}
          className="hidden"
          id="gallery-upload"
        />
        <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center gap-3">
          <Icon icon="solar:gallery-add-linear" width={48} className="text-zinc-400" />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-zinc-600">
              Перетягніть зображення або{' '}
              <span className="text-zinc-900 font-medium">виберіть файли</span>
            </p>
            <p className="text-xs text-zinc-400">
              Формати: <span className="font-medium">JPEG, PNG</span> · Максимальний розмір:{' '}
              <span className="font-medium">10MB</span> на файл
            </p>
          </div>
        </label>
      </div>

      {rejectedFiles.length > 0 && (
        <div className="flex flex-col gap-1">
          {rejectedFiles.map((msg) => (
            <p key={msg} className="text-xs text-red-500">
              {msg}
            </p>
          ))}
        </div>
      )}

      {compressMsg && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
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
    </div>
  );
}
