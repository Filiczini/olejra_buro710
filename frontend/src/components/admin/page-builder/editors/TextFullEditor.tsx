import type { BlockData, TextFullData } from '@buro710/shared';

interface TextFullEditorProps {
  blockId: string;
  data: TextFullData;
  onChange: (data: BlockData) => void;
}

export default function TextFullEditor({ blockId, data, onChange }: TextFullEditorProps) {
  const updateField = (field: keyof TextFullData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const f = (name: string) => `${blockId}-${name}`;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={f('label')} className="block text-sm font-medium text-zinc-700 mb-2">
          Мітка (наприклад: "The Concept")
        </label>
        <input
          id={f('label')}
          name={f('label')}
          type="text"
          value={data.label || ''}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="The Concept"
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label htmlFor={f('content')} className="block text-sm font-medium text-zinc-700 mb-2">
          Текст цитати
        </label>
        <textarea
          id={f('content')}
          name={f('content')}
          value={data.content || ''}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="Введіть текст цитати..."
          rows={4}
          className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-zinc-700 mb-2">Статистика (опціонально)</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor={f('area')} className="sr-only">
              Площа
            </label>
            <input
              id={f('area')}
              name={f('area')}
              type="text"
              value={data.area || ''}
              onChange={(e) => updateField('area', e.target.value)}
              placeholder="Площа (м²)"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>
          <div>
            <label htmlFor={f('months')} className="sr-only">
              Місяців
            </label>
            <input
              id={f('months')}
              name={f('months')}
              type="text"
              value={data.months || ''}
              onChange={(e) => updateField('months', e.target.value)}
              placeholder="Місяців"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
            />
          </div>
          <div>
            <label htmlFor={f('year')} className="sr-only">
              Рік
            </label>
            <input
              id={f('year')}
              name={f('year')}
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
