import { Icon } from '@iconify-icon/react';
import type { TextImageData } from '@buro710/shared';

interface TextImageBlockProps {
  data: TextImageData;
  mirrored?: boolean;
}

export default function TextImageBlock({ data, mirrored }: TextImageBlockProps) {
  const { text, image_url, image_alt, icon, label, title, features } = data;

  if (!text && !image_url) return null;

  const order = mirrored ? 'md:order-1' : 'md:order-2';
  const textOrder = mirrored ? 'md:order-2' : 'md:order-1';

  return (
    <section className="group px-5 py-5 md:px-10 md:py-8">
      <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className={`relative aspect-[4/5] ${order} overflow-hidden`}>
          <img
            src={image_url}
            alt={image_alt || title || ''}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>

        <div className={`flex flex-col justify-center ${textOrder}`}>
          <div className="max-w-md md:m-auto">
            {(icon || label) && (
              <div className="flex items-center gap-2 mb-6">
                {icon && <Icon icon={icon} className="text-zinc-400" width={20} />}
                {label && (
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                    {label}
                  </span>
                )}
              </div>
            )}

            {title && (
              <h3 className="text-3xl md:text-[34px] font-display tracking-tight text-zinc-900 mb-6">
                {title}
              </h3>
            )}

            {text && (
              <p className="text-zinc-600 text-base leading-relaxed mb-8 whitespace-pre-wrap">
                {text}
              </p>
            )}

            {features && features.length > 0 && (
              <ul className="space-y-4 border-t border-zinc-200 pt-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon
                      icon="solar:check-circle-linear"
                      className="text-zinc-900 mt-0.5"
                      width={16}
                    />
                    <span className="text-sm text-zinc-600">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
