interface TextFullBlockProps {
  content: string;
}

export default function TextFullBlock({ content }: TextFullBlockProps) {
  if (!content) return null;

  return (
    <div className="w-full py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="prose prose-zinc prose-lg max-w-none">
          {content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-zinc-700 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
