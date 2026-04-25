import { useState } from 'react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  label?: string;
  placeholder?: string;
}

export default function TagInput({
  tags,
  onTagsChange,
  maxTags = 5,
  label = 'Теги',
  placeholder = 'Введіть тег і натисніть Enter',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const canAddMore = tags.length < maxTags;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !tags.includes(trimmedValue) && canAddMore) {
        onTagsChange([...tags, trimmedValue]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="tag-input" className="text-sm font-medium text-zinc-700">
        {label}{' '}
        {maxTags && (
          <span className="text-zinc-400">
            ({tags.length}/{maxTags})
          </span>
        )}
      </label>
      <div
        className={`flex flex-wrap gap-2 min-h-[48px] px-3 py-2 border border-zinc-200 rounded-lg focus-within:ring-2 focus-within:ring-zinc-900 focus-within:border-transparent ${
          !canAddMore ? 'bg-zinc-50' : ''
        }`}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(index)}
              className="text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              ✕
            </button>
          </span>
        ))}
        {canAddMore && (
          <input
            id="tag-input"
            name="tag-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          />
        )}
      </div>
    </div>
  );
}
