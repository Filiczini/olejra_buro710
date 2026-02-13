interface ImageFullBlockProps {
  image_url: string;
  alt?: string;
}

export default function ImageFullBlock({ image_url, alt }: ImageFullBlockProps) {
  if (!image_url) return null;

  return (
    <div className="w-full py-8 md:py-12">
      <div className="w-full">
        <img
          src={image_url}
          alt={alt || ''}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
