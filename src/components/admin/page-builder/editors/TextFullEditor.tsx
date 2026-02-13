import type { BlockData } from '../../../../types/block';

interface TextFullEditorProps {
  data: { content: string };
  onChange: (data: BlockData) => void;
}

export default function TextFullEditor({ data, onChange }: TextFullEditorProps) {
  const handleChange = (value: string) => {
    onChange({ content: value });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-2">
        Текст
      </label>
      <textarea
        value={data.content || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Введіть текст..."
        rows={6}
        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
      />
    </div>
  );
}
