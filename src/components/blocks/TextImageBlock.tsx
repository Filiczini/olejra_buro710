interface TextImageBlockProps {
  text: string;
  image_url: string;
  image_alt?: string;
  mirrored?: boolean;
}

export default function TextImageBlock({ text, image_url, image_alt, mirrored }: TextImageBlockProps) {
  if (!text && !image_url) return null;

  const order = mirrored ? 'md:flex-row-reverse' : 'md:flex-row';

  return (
    <div className="w-full py-8 md:py-12">
      <div className={`flex flex-col ${order} gap-8 md:gap-12`}>
        <div className="flex-1 md:w-1/2">
          <div className="prose prose-zinc max-w-none">
            {text?.split('\n').map((paragraph, index) => (
              <p key={index} className="text-zinc-700 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        <div className="flex-1 md:w-1/2">
          {image_url && (
            <img
              src={image_url}
              alt={image_alt || ''}
              className="w-full h-auto object-cover rounded-lg"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
