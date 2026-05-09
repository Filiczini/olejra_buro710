import { useMemo, useState } from 'react';
import { Icon } from '@iconify-icon/react';

interface SeoFieldsProps {
  seoTitle: string;
  seoDescription: string;
  ogImageUrl?: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onOgImageChange?: (file: File | null) => void;
  onBlurField?: (field: string, value: string) => void;
  errors?: {
    seo_title?: string;
    seo_description?: string;
  };
}

export default function SeoFields({
  seoTitle,
  seoDescription,
  ogImageUrl,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onOgImageChange,
  onBlurField,
  errors,
}: SeoFieldsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(ogImageUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.onerror = () => setPreviewUrl(null);
      reader.readAsDataURL(file);
      onOgImageChange?.(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onOgImageChange?.(null);
  };

  const titleLength = seoTitle.length;
  const descLength = seoDescription.length;
  const titleColor = useMemo(
    () =>
      titleLength > 60 ? 'text-red-500' : titleLength > 50 ? 'text-yellow-600' : 'text-zinc-500',
    [titleLength]
  );
  const descColor = useMemo(
    () =>
      descLength > 160 ? 'text-red-500' : descLength > 140 ? 'text-yellow-600' : 'text-zinc-500',
    [descLength]
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Icon icon="solar:magnifer-linear" width={20} className="text-zinc-500" />
          <span className="font-medium text-zinc-900">SEO налаштування</span>
          {(seoTitle || seoDescription) && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              Заповнено
            </span>
          )}
        </div>
        <Icon
          icon={isExpanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
          width={20}
          className="text-zinc-400"
        />
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-zinc-100">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="seo-title" className="block text-sm font-medium text-zinc-700">
                SEO Title
              </label>
              <span className={`text-xs ${titleColor}`}>{titleLength}/60</span>
            </div>
            <input
              id="seo-title"
              name="seo_title"
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              onBlur={(e) => onBlurField?.('seo_title', e.target.value)}
              placeholder="Заголовок для пошукових систем"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
                errors?.seo_title ? 'border-red-500' : 'border-zinc-200'
              }`}
              maxLength={100}
            />
            {errors?.seo_title && <p className="text-sm text-red-500 mt-1">{errors.seo_title}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="seo-description" className="block text-sm font-medium text-zinc-700">
                SEO Description
              </label>
              <span className={`text-xs ${descColor}`}>{descLength}/160</span>
            </div>
            <textarea
              id="seo-description"
              name="seo_description"
              value={seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              onBlur={(e) => onBlurField?.('seo_description', e.target.value)}
              placeholder="Опис для пошукових систем"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none ${
                errors?.seo_description ? 'border-red-500' : 'border-zinc-200'
              }`}
              maxLength={200}
            />
            {errors?.seo_description && (
              <p className="text-sm text-red-500 mt-1">{errors.seo_description}</p>
            )}
          </div>

          {onOgImageChange && (
            <div>
              <label
                htmlFor="og-image-upload"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                OG Image (для соціальних мереж)
              </label>

              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="OG Preview"
                    className="w-full h-32 object-cover rounded-lg border border-zinc-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Icon icon="solar:close-circle-linear" width={20} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="og-image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                >
                  <Icon icon="solar:cloud-upload-linear" width={32} className="text-zinc-400" />
                  <span className="mt-2 text-sm text-zinc-500">Завантажити зображення</span>
                  <input
                    id="og-image-upload"
                    name="og_image"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
