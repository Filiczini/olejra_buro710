import type { BlockData, TextFullData } from '../../../../types/block';

interface TextFullEditorProps {
  data: TextFullData;
  onChange: (data: BlockData) => void;
}

export default function TextFullEditor({ data, onChange }: TextFullEditorProps) {
  const updateField = (field: keyof TextFullData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Мітка (наприклад: "The Concept")
        </label>
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="The Concept"
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Текст цитати</label>
        <textarea
          value={data.content || ''}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="Введіть текст цитати..."
          rows={4}
          className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Статистика (опціонально)
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              value={data.area || ''}
              onChange={(e) => updateField('area', e.target.value)}
              placeholder="Площа (м²)"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              value={data.months || ''}
              onChange={(e) => updateField('months', e.target.value)}
              placeholder="Місяців"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              value={data.year || ''}
              onChange={(e) => updateField('year', e.target.value)}
              placeholder="Рік"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
