interface FullWidthImageProps {
  imageUrl: string;
  caption?: string;
  alt?: string;
}

export default function FullWidthImage({ imageUrl, caption, alt }: FullWidthImageProps) {
  return (
    <section className="w-full h-[80vh] bg-zinc-100 overflow-hidden">
      <img
        src={imageUrl}
        alt={alt || ''}
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-out"
      />
    </section>
  );
}
