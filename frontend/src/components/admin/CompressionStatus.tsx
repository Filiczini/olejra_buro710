import { Icon } from '@iconify-icon/react';

interface CompressionStatusProps {
  message: string | null;
  className?: string;
}

/** Shows compressImage()'s progress/result line — a spinner while working, a checkmark once done. */
export default function CompressionStatus({ message, className = '' }: CompressionStatusProps) {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-1.5 text-xs text-zinc-500 ${className}`.trim()}>
      {message.includes('→') ? (
        <Icon
          icon="solar:check-circle-linear"
          width={14}
          className="text-green-500 flex-shrink-0"
        />
      ) : (
        <Icon icon="solar:spinner-linear" width={14} className="animate-spin flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
