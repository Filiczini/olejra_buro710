import { useState } from 'react';

interface FeatureTagsInputProps {
  features?: string[];
  onChange: (features: string[]) => void;
  id?: string;
  label?: string;
}

export default function FeatureTagsInput({
  features = [],
  onChange,
  id: idProp,
  label = 'Особливості (features)',
}: FeatureTagsInputProps) {
  const [newFeature, setNewFeature] = useState('');
  const inputId = idProp || 'feature-tags-input';

  const addFeature = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      onChange([...features, trimmed]);
    }
  };

  const removeFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',');
      addFeature(parts[0]);
      setNewFeature(parts.slice(1).join(','));
    } else {
      setNewFeature(value);
    }
  };

  const handleFeatureBlur = () => {
    if (newFeature.trim()) {
      addFeature(newFeature);
      setNewFeature('');
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-medium text-zinc-600 mb-1">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          id={inputId}
          name={inputId}
          type="text"
          value={newFeature}
          onChange={handleFeatureChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (newFeature.trim()) {
                addFeature(newFeature);
                setNewFeature('');
              }
            }
          }}
          onBlur={handleFeatureBlur}
          placeholder="Додати особливість"
          className="flex-1 px-2 py-1.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            if (newFeature.trim()) {
              addFeature(newFeature);
              setNewFeature('');
            }
          }}
          className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 text-sm cursor-pointer"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {features.map((feature, index) => (
          <span
            key={`${index}-${feature}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-xs"
          >
            {feature}
            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="text-zinc-400 hover:text-red-500 cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
