export const getEntityTypeBadge = (type: string) => {
  switch (type) {
    case 'project':
      return 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20';
    case 'post':
      return 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getEntityTypeText = (type: string) => {
  switch (type) {
    case 'project':
      return 'Проєкт';
    case 'post':
      return 'Сторінка';
    default:
      return type;
  }
};

export const formatChanges = (changes: Record<string, unknown>) => {
  if (!changes || Object.keys(changes).length === 0) return '-';

  const parts: string[] = [];

  if (changes.fields && Array.isArray(changes.fields) && changes.fields.length > 0) {
    parts.push(`Поля: ${changes.fields.join(', ')}`);
  }

  if (changes.hero_updated) {
    if (
      changes.hero_fields &&
      Array.isArray(changes.hero_fields) &&
      changes.hero_fields.length > 0
    ) {
      parts.push(`Hero: ${changes.hero_fields.join(', ')}`);
    } else {
      parts.push('Hero оновлено');
    }
  }

  if (changes.blocks_count !== undefined) {
    parts.push(`Блоків: ${changes.blocks_count}`);
  }

  if (typeof changes.media_added === 'number' && changes.media_added > 0) {
    parts.push(`Медіа+: ${changes.media_added}`);
  }

  if (typeof changes.media_removed === 'number' && changes.media_removed > 0) {
    parts.push(`Медіа-: ${changes.media_removed}`);
  }

  if (changes.media_reordered) {
    parts.push('Порядок медіа');
  }

  return parts.length > 0 ? parts.join(' | ') : '-';
};

export const getActionBadge = (action: string) => {
  switch (action) {
    case 'create':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/10';
    case 'update':
      return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10';
    case 'delete':
      return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-700/10';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getActionText = (action: string) => {
  switch (action) {
    case 'create':
      return 'Створення';
    case 'update':
      return 'Редагування';
    case 'delete':
      return 'Видалення';
    default:
      return action;
  }
};
